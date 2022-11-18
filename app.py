#!/bin/python3
import flask, flask_login
from flask import url_for, request, render_template, redirect
from flask_login import current_user
import collections, json, random
from datetime import datetime
from base import app,load_info,ajax,DBDict,DBList,random_id,hash_id,full_url_for

# -- Info for every Hack-A-Day project --
load_info({
    "project_name": "Hack-A-Crop",
    "source_url": "https://github.com/za3k/day18_crop",
    "subdir": "/hackaday/crop",
    "description": "tool to crop a picture to a fixed size",
    "instructions": "",
    "login": False,
    "fullscreen": False,
})

# -- Routes specific to this Hack-A-Day project --

@app.route("/")
def index():
    return flask.render_template('index.html')
