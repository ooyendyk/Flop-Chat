import os
import json
import requests

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, send

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
room_list = {}


@app.route('/')
def index():
    return render_template('/index.html')

@socketio.on('connect')
def connect():
    emit('roomList', 'Home', broadcast=False)

@socketio.on('connected')
def connected():
    for item in room_list:
        emit('connectedReply', item, broadcast=True)
    emit('connectedDone', False, broadcast=True)

@socketio.on('messageSend')
def handleMessage(dict):
    if (len(room_list[dict['roomCurrent']]) <= 100):
        room_list[dict['roomCurrent']].append(dict['messageSend'])
    else:
        room_list[dict['roomCurrent']].pop(0)
        room_list[dict['roomCurrent']].append(dict['messageSend'])
    emit('message', dict, broadcast=True)

@socketio.on('roomChangeRequest')
def roomChangeRequest(dict):
    if dict['roomKey'] in room_list:
        dict['roomData'] = room_list[dict['roomKey']]
        emit('roomChange', dict, broadcast=True)

@socketio.on('roomCreate')
def roomCreate(room):
    room_list[room] = []
    emit('roomNew', room, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)