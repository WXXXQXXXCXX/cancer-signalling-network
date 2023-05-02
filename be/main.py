from flask import Flask, request, Response
import json
from flask_cors import CORS
import motif
from gene_pairs import get_gene_pairs

app = Flask(__name__)
CORS(app)


@app.route('/motif', methods=['POST'])
def get_motif():
    app.logger.info('get_motif')
    data = request.get_data()
    res = motif.find_motif(json.loads(data))
    resp = Response(json.dumps(res), mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


@app.route('/simplify', methods=['POST'])
def simplify():
    app.logger.info('get_motif')
    data = request.get_data()
    data = json.loads(data)
    res = motif.simplify_graph(data['nodes'], data['edges'], data['groups'])
    resp = Response(json.dumps(res), mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route('/pairs', methods=['POST'])
def gene_pairs():
    app.logger.info('gene_pairs')
    data = request.get_data()
    data = json.loads(data)
    pairs = get_gene_pairs(data['oncogenes'], data['cancer_type'], data['m'], data['k'])
    res = {'gene_pairs': pairs}
    resp = Response(json.dumps(res), mimetype='application/json')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

if __name__ == '__main__':
    app.run(host="localhost", port=3000, debug=True)
