import json, re, statistics, glob

def extrair(caminho):
    with open(caminho, encoding='utf-8') as f:
        conteudo = f.read()
    m = re.search(r'window\.__LIGHTHOUSE_JSON__\s*=\s*(\{.*?\})\s*;\s*(?:</script>|window\.)', conteudo, re.S)
    if not m:
        # tenta capturar até o fim do script de outra forma
        m = re.search(r'window\.__LIGHTHOUSE_JSON__\s*=\s*(\{.*\})\s*</script>', conteudo, re.S)
    if not m:
        raise ValueError(f"JSON não encontrado em {caminho}")
    dados = json.loads(m.group(1))
    cats = dados['categories']
    audits = dados['audits']
    return {
        'performance': cats['performance']['score'] * 100,
        'acessibilidade': cats['accessibility']['score'] * 100,
        'boas-praticas': cats['best-practices']['score'] * 100,
        'seo': cats['seo']['score'] * 100,
        'lcp': audits['largest-contentful-paint']['numericValue'],
        'cls': audits['cumulative-layout-shift']['numericValue'],
        'tbt': audits['total-blocking-time']['numericValue'],
    }

combinacoes = [
    ('inicio', 'mobile'),
    ('inicio', 'desktop'),
    ('detalhe', 'mobile'),
    ('detalhe', 'desktop'),
]

resultado = {}
for pagina, perfil in combinacoes:
    arquivos = sorted(glob.glob(f'relatorios/{pagina}-{perfil}-*.html'))
    medidas = [extrair(a) for a in arquivos]
    mediana = {k: statistics.median(m[k] for m in medidas) for k in medidas[0]}
    resultado[f'{pagina}-{perfil}'] = {'arquivos': arquivos, 'medidas': medidas, 'mediana': mediana}

for chave, dados in resultado.items():
    print(f"\n=== {chave} ({len(dados['arquivos'])} execuções) ===")
    for k, v in dados['mediana'].items():
        print(f"  {k}: {v:.3f}" if isinstance(v, float) else f"  {k}: {v}")

with open('/tmp/lighthouse_resultado.json', 'w') as f:
    json.dump(resultado, f, indent=2)
