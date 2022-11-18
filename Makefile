run-debug:
	flask --debug run
run-demo:
	gunicorn3 -e SCRIPT_NAME=/hackaday/crop --bind 0.0.0.0:8018 app:app
