.PHONY: api-dev
api-dev:
	cd $(shell git rev-parse --show-toplevel) && \
	uvicorn apps.api.main:app --reload --host 0.0.0.0 --port 8000
