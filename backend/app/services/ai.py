import requests


class AIService:

    @staticmethod
    def generate_business_recommendation(
        revenue: float,
        orders: int,
        products: int,
        inventory: int,
    ) -> str:

        prompt = f"""
You are the AI business advisor for RazorGrow, a small-business intelligence platform.

Analyze these business metrics:

Revenue: ₹{revenue:.2f}
Completed Orders: {orders}
Active Products: {products}
Inventory Units: {inventory}

Give practical advice for the business owner.

Requirements:
- Give 2 to 4 short recommendations.
- Focus on increasing sales and improving inventory movement.
- Use simple language.
- Do not invent data.
- Mention the most important problem first.
- Keep the response under 150 words.

Format:
1. Recommendation
2. Recommendation
3. Recommendation
"""

        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen3:4b",
                    "prompt": prompt,
                    "stream": False,
                },
                timeout=120,
            )

            response.raise_for_status()

            data = response.json()

            return data.get(
                "response",
                "AI could not generate a recommendation."
            ).strip()

        except requests.exceptions.RequestException as error:
            print(f"Ollama error: {error}")

            return (
                "Local AI is currently unavailable. "
                "Please make sure Ollama is running."
            )