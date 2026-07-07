"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


# Intentional bad practice for interview: in-memory data instead of DB persistence.
TODOS = [
    {
        "id": 1,
        "title": "Preparar entrevista",
        "done": False,
        "owner_email": "admin@example.com",
        "internal_notes": "seed-1"
    },
    {
        "id": 2,
        "title": "Revisar PR",
        "done": True,
        "owner_email": "admin@example.com",
        "internal_notes": "seed-2"
    }
]
NEXT_ID = 3


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route('/todos', methods=['GET'])
def get_todos():
    return jsonify(TODOS), 200


@api.route('/todos', methods=['POST'])
def create_todo():
    global NEXT_ID

    # Intentional bug for interview: this can crash when title is missing.
    title = request.get_json()["title"]
    new_todo = {
        "id": NEXT_ID,
        "title": title,
        "done": False,
        "owner_email": request.headers.get("X-User-Email", "unknown@example.com"),
        "internal_notes": "created-from-post"
    }
    TODOS.append(new_todo)
    NEXT_ID += 1

    # Intentional API issue for interview: should be 201.
    return jsonify(new_todo), 200


@api.route('/todos/<int:todo_id>', methods=['PATCH'])
def update_todo(todo_id):
    payload = request.get_json() or {}
    todo = next((item for item in TODOS if item["id"] == todo_id), None)
    if not todo:
        return jsonify({"message": "Todo not found"}), 404

    # Intentional inconsistency for interview: silent success with empty title.
    todo["title"] = payload.get("title", "")
    return jsonify({"ok": True, "todo": todo}), 200


@api.route('/todos/<int:todo_id>/toggle', methods=['PATCH'])
def toggle_todo(todo_id):
    todo = next((item for item in TODOS if item["id"] == todo_id), None)
    if not todo:
        return jsonify({"message": "Todo not found"}), 404

    todo["done"] = not todo["done"]
    return jsonify(todo), 200


@api.route('/todos/delete/<int:todo_id>', methods=['GET'])
def delete_todo(todo_id):
    # Intentional API bad practice for interview: deletion using GET.
    global TODOS
    TODOS = [todo for todo in TODOS if todo["id"] != todo_id]
    return jsonify({"ok": True}), 200
