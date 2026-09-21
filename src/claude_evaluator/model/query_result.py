from pydantic import BaseModel


class QueryResult(BaseModel):
    result: str
    errors: list[str]
