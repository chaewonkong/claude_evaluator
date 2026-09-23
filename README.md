# Claude Evaluator
A Web UI based Claude chat accompanied with evaluated scores powered by Jev.

With this project, a user can do the following interactively in webpage with chatting UI:
- User sends a question
- Claude reasons and answer
- Jev evaluates the answer
- User can read answers with evaluated scores

## Run

The following command will build frontend, then run backend app. You can check out and use it in the browser: localhost:8000

```shell
$ just dev
```

You can also use docker compose for running.

## Run with Docker
You can run the app with docker compose:

```shell
$ docker compose up
```

### Claude Login
when running with docker, claude api should be properly set.