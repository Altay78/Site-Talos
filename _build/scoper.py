# -*- coding: utf-8 -*-
"""Scope un CSS de section sous une classe racine, en retirant les rgles de preview."""
import re

DROP_SELECTORS = ('*', 'body', 'html', '::selection', 'html, :host')


def split_blocks(css):
    """Dcoupe un CSS en (prelude, body) au niveau des accolades de premier niveau."""
    out, i, n = [], 0, len(css)
    while i < n:
        # saute les commentaires et blancs
        m = re.match(r'\s*/\*.*?\*/\s*', css[i:], re.S)
        while m:
            i += m.end()
            m = re.match(r'\s*/\*.*?\*/\s*', css[i:], re.S)
        if i >= n:
            break
        j = css.find('{', i)
        if j == -1:
            break
        # Tailwind v4 met des instructions sans bloc (`@layer a, b;`, `@import`).
        # Sans ce garde-fou elles sont avalées dans le prélude de la règle
        # suivante, dont le sélecteur devient invalide.
        semi = css.find(';', i)
        if semi != -1 and semi < j:
            stmt = css[i:semi + 1].strip()
            if stmt:
                out.append((stmt, None))
            i = semi + 1
            continue
        prelude = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{':
                depth += 1
            elif css[k] == '}':
                depth -= 1
            k += 1
        out.append((prelude, css[j + 1:k - 1]))
        i = k
    return out


def scope_selector(sel, scope, root_class):
    sel = sel.strip()
    if not sel:
        return None
    if sel in DROP_SELECTORS:
        return None
    if '.tsw' in sel or '.spacer' in sel:
        return None
    # Blocs de tokens de preview : chaque fichier de section porte la mention
    # « à SUPPRIMER à l'intégration, tokens fournis par v2.css ». C'est fait —
    # ils sont remplacés par la couche DA unique (da.py).
    if sel == ':root' or sel == 'html[data-theme="light"]':
        return None
    if sel.startswith('html[data-theme="light"]'):
        rest = sel[len('html[data-theme="light"]'):].strip()
        if not rest:
            return 'html[data-theme="light"] ' + scope
        if root_class and (rest == root_class or re.match(re.escape(root_class) + r'(?![\w-])', rest)):
            rest = scope + rest[len(root_class):]
            return 'html[data-theme="light"] ' + rest
        return 'html[data-theme="light"] ' + scope + ' ' + rest
    if root_class and re.match(re.escape(root_class) + r'(?![\w-])', sel):
        return scope + sel[len(root_class):]
    return scope + ' ' + sel


def scope_css(css, scope, root_class=None, kf_prefix=''):
    kf_names = []
    out = []

    def walk(blocks, indent=''):
        for prelude, body in blocks:
            if body is None:
                out.append(prelude)
            elif prelude.startswith('@keyframes'):
                name = prelude.split()[1].strip()
                kf_names.append(name)
                out.append('@keyframes %s%s{%s}' % (kf_prefix, name, body.strip()))
            elif prelude.startswith('@media') or prelude.startswith('@supports'):
                inner = []
                for p2, b2 in split_blocks(body):
                    if p2.startswith('@keyframes'):
                        name = p2.split()[1].strip()
                        kf_names.append(name)
                        inner.append('@keyframes %s%s{%s}' % (kf_prefix, name, b2.strip()))
                        continue
                    sels = [scope_selector(s, scope, root_class) for s in p2.split(',')]
                    sels = [s for s in sels if s]
                    if sels and b2.strip():
                        inner.append('%s{%s}' % (','.join(sels), b2.strip()))
                if inner:
                    out.append('%s{\n%s\n}' % (prelude, '\n'.join(inner)))
            else:
                sels = [scope_selector(s, scope, root_class) for s in prelude.split(',')]
                sels = [s for s in sels if s]
                if sels and body.strip():
                    out.append('%s{%s}' % (','.join(sels), body.strip()))

    walk(split_blocks(css))
    result = '\n'.join(out)
    # renomme les rfrences aux keyframes dans les dclarations
    if kf_prefix:
        for name in set(kf_names):
            result = re.sub(r'(?<![\w-])' + re.escape(name) + r'(?![\w-])',
                            kf_prefix + name, result)
            result = result.replace('@keyframes ' + kf_prefix + kf_prefix + name,
                                    '@keyframes ' + kf_prefix + name)
    return result


def strip_rules(css, needles):
    """Retire toute règle dont le sélecteur contient l'un des `needles`.

    Sert à évacuer du <head> le CSS des sections de l'export qui ne sont plus
    dans la page (.talos-scroll, .talos-features) — ~14 Ko de règles mortes,
    qui traînaient aussi des polices (Manrope, Inter) hors DA.
    """
    out = []
    for prelude, body in split_blocks(css):
        if body is None:                      # instruction sans bloc
            out.append(prelude)
        elif prelude.startswith('@keyframes') or prelude.startswith('@property'):
            out.append('%s{%s}' % (prelude, body))
        elif prelude.startswith('@'):
            inner = strip_rules(body, needles)
            if inner.strip():
                out.append('%s{%s}' % (prelude, inner))
        else:
            sels = [s for s in prelude.split(',')
                    if not any(n in s for n in needles)]
            if sels and body.strip():
                out.append('%s{%s}' % (','.join(sels), body))
    return '\n'.join(out)


def extract(path):
    """Retourne (css, markup_body, scripts) d'un fichier de section."""
    s = open(path, encoding='utf-8').read()
    css = '\n'.join(re.findall(r'<style>(.*?)</style>', s, re.S))
    body = re.search(r'<body[^>]*>(.*)</body>', s, re.S).group(1)
    scripts = re.findall(r'<script>(.*?)</script>', body, re.S)
    body = re.sub(r'<script>.*?</script>', '', body, flags=re.S)
    return css, body, scripts
