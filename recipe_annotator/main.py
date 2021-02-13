from flask import Flask, render_template, redirect, url_for, request, jsonify
from flask import send_file
from os import walk
import pandas as pd

app = Flask(__name__)

def loadtable():
    table = pd.read_csv('../output/annotations.csv', index_col=0)
    return table

def savetable(table):
    table.to_csv('../output/annotations.csv')

def appendtable(table, newrow):
    newrow  = pd.DataFrame([newrow], columns=newrow.keys())
    table = pd.concat([table, newrow], axis =0)
    return table

@app.route("/")
def index():
    directory = app.config['IMAGES']
    image = app.config["FILES"][app.config["HEAD"]]
    labels = app.config["LABELS"]
    not_end = not(app.config["HEAD"] == len(app.config["FILES"]) - 1)
    print(not_end)
    return render_template("index.html", not_end=not_end, directory=directory, image=image, labels=labels, head=app.config["HEAD"] + 1, len=len(app.config["FILES"]))

@app.route('/postmethod', methods=['POST'])
def postmethod():
    data = request.get_json()
    newrow = data['sub_roi']
    newrow['filename'] = app.config["FILES"][app.config["HEAD"]]
    table = loadtable()
    table = appendtable(table, newrow)
    savetable(table)
    return jsonify(data)

@app.route('/delmethod', methods=['POST'])
def delmethod():
    data = request.get_json()
    data['filename'] = app.config["FILES"][app.config["HEAD"]]
    table = loadtable()
    drop_cols = (table['id']==data['id']) & (table['filename']==data['filename'])
    print(drop_cols.columns)
    table = table.drop(drop_cols)
    print(table)
    print(app.config["FILES"][app.config["HEAD"]])
    return jsonify(data)

@app.route('/next')
def next():
    image = app.config["FILES"][app.config["HEAD"]]
    app.config["HEAD"] = app.config["HEAD"] + 1
    with open(app.config["OUT"],'a') as f:
        for label in app.config["LABELS"]:
            f.write(image + "," +
            label["id"] + "," +
            label["name"] + "," +
            str(round(float(label["xMin"]))) + "," +
            str(round(float(label["xMax"]))) + "," +
            str(round(float(label["yMin"]))) + "," +
            str(round(float(label["yMax"]))) + "\n")
    app.config["LABELS"] = []
    return redirect(url_for('index'))

@app.route('/image/<f>')
def images(f):
    images = app.config['IMAGES']
    return send_file(images + f)

if __name__ == "__main__":
    directory = '../data/'
    app.config["IMAGES"] = directory
    app.config["LABELS"] = []
    files = None
    for (dirpath, dirnames, filenames) in walk(app.config["IMAGES"]):
        files = filenames
        break
    if files == None:
        print("No files")
        exit()
    app.config["FILES"] = files
    app.config["HEAD"] = 0
    app.config["OUT"] = "out.csv"
    print(files)
    # with open("out.csv",'w') as f:
    #     f.write("image,id,name,xMin,xMax,yMin,yMax\n")
    app.run(debug="True")