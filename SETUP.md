# YouFluent - Setup Local

## Requisitos
- Python 3.10+
- pip

## Instalacao

```bash
# Clonar o repositorio
git clone https://github.com/Allysson-Christopher/YouFluent.git
cd YouFluent

# Criar ambiente virtual
python3 -m venv venv

# Ativar ambiente virtual
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Instalar dependencias
pip install youtube-transcript-api flask flask-cors
```

## Executar

Abra dois terminais na pasta do projeto:

### Terminal 1 - Backend (Flask)
```bash
source venv/bin/activate
python server.py
```
O backend roda em http://localhost:5000

### Terminal 2 - Frontend
```bash
python3 -m http.server 8080
```
O frontend roda em http://localhost:8080

## Usar

1. Acesse http://localhost:8080
2. Cole um link de video do YouTube em ingles
3. Clique em "Criar Aula"
4. Navegue pelos trechos usando os botoes

## Estrutura

```
YouFluent/
├── index.html      # Frontend
├── server.py       # Backend Flask
├── SETUP.md        # Este arquivo
└── venv/           # Ambiente virtual (ignorado no git)
```
