const fetch = require("node-fetch");

const URL = (engine) => `https://api.openai.com/v1/engines/${engine}/completions`;

function body (prompt) {
    return {
        "prompt": prompt,
        "temperature": 0.35,
        "max_tokens": 12,
        "top_p": 0.5,
        "frequency_penalty": 0.5,
        "presence_penalty": 0,
        "stop": []
    }
}

exports.handler = async function(event, context) {
    const { engine = 'ada', API_KEY } = process.env;
    const { prompt } = event.queryStringParameters;

    const reponse = await fetch(
        `${URL(engine)}`,
        {
            method: 'post',
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"

            },
            body: JSON.stringify(body(prompt))
        }
    );

    const data = await reponse.json();
    return { 
        statusCode: 200, 
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ data }) 
    };
};