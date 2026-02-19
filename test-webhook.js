const email = "murilocruisedev@gmail.com";
const url = "https://ggfex-community.vercel.app/api/webhook/kiwify";

async function testWebhook() {
    console.log(`Enviando Webhook de Teste para ${email}...`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                order_status: "paid",
                Customer: {
                    email: email,
                    full_name: "Murilo Teste Kiwify",
                    name: "Murilo Teste Kiwify"
                }
            })
        });

        const data = await response.json();
        console.log("Resposta do Servidor:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Erro no teste:", error);
    }
}

testWebhook();
