from openai import OpenAI
#import EmbeddingsFunction
from BotCode.EmbeddingsFunction import embed_text
from pinecone import Pinecone
import os
from flask import Flask, request, jsonify 
from flask_cors import CORS
from supabase import create_client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url,key)
    
client = OpenAI(api_key = os.getenv("OPENAI_API_KEY"))
pc = Pinecone(api_key= os.getenv("PINECONE_API_KEY"))
index = pc.Index("docs")

##takes the question and returns the related chunks
def get_docs(question):
    ##get embedding of the question and get a list of rows that are related
    embedding = embed_text(question)
    docs = index.query(vector=embedding, top_k=3, include_metadata=True)
    
    ##creates a list of text from the rows
    context = []
    for match in docs['matches']:
        context.append(match['metadata']['text'])
    
    return(context)

def generate_text(question):
    context = get_docs(question)
    context = "\n".join(context)
    
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": f"Context: {context}\n\nQuestion: {question}"}
        ]
    )


    return(completion.choices[0].message.content)

#@app.route("/bot", methods=['POST'])
#def bot():
#    question = request.json['query']
#    return(jsonify({'text' : generate_text(question)}))
#    #return(jsonify({'text' : 'I am the bot'}))

#if __name__ == '__main__':
#   app.run(debug=True, port=5000)