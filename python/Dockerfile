FROM python:3.10

WORKDIR /app

COPY pyproject.toml poetry.lock* /app/

RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi

COPY . /app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0"]