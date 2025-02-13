from flask import Flask, jsonify, request, send_from_directory
import sys
import os

sys.path.append("config")
import config
from createsend import List, Subscriber

app = Flask(__name__, static_folder='static')


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)


@app.route('/api/subscribers', methods=['GET'])
def get_subscribers():
    try:
        list_api = List({"api_key": config.API_KEY}, config.LIST_ID)
        response = list_api.active()

        if not hasattr(response, "Results") or response.Results is None:
            return jsonify({"status": "success", "subscribers": []})

        subscribers = [
            {"email": sub.EmailAddress, "name": sub.Name}
            for sub in response.Results
        ]

        return jsonify({"status": "success", "subscribers": subscribers})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/subscribers', methods=['POST'])
def add_subscriber():
    try:
        data = request.json

        subscriber = Subscriber(
            auth={"api_key": config.API_KEY}
        )

        response = subscriber.add(
            list_id=config.LIST_ID,
            email_address=data["email"],
            name=data["name"],
            custom_fields=[],
            resubscribe=True,
            consent_to_track="Unchanged"
        )

        return jsonify({"status": "success", "message": "Subscriber added"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/api/subscribers', methods=['DELETE'])
def delete_subscriber():
    try:
        email = request.args.get("email")

        if not email:
            return jsonify({"status": "error", "message": "Email is required"}), 400

        subscriber = Subscriber(
            auth={"api_key": config.API_KEY},
            list_id=config.LIST_ID,
            email_address=email
        )

        response = subscriber.delete()

        return jsonify({"status": "success", "message": "Subscriber removed"})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
