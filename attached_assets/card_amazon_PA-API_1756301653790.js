const express = require("express");
const fetch = require("node-fetch");

const app = express();

// Chaves da API da Amazon (substitua pelas suas)
const ACCESS_KEY = "SUA_CHAVE_DE_ACESSO";
const SECRET_KEY = "SUA_CHAVE_SECRETA";
const PARTNER_TAG = "SEU_ID_AFILIADO-20";
const REGION = "us-east-1"; // ou "eu-west-1", dependendo do país

app.get("/produto/:asin", async (req, res) => {
  const asin = req.params.asin;

  // Endpoint da Amazon PA-API
  const url = `https://webservices.amazon.com/paapi5/getitems`;

  const body = {
    "ItemIds": [asin],
    "Resources": [
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "Offers.Listings.Price"
    ],
    "PartnerTag": PARTNER_TAG,
    "PartnerType": "Associates",
    "Marketplace": "www.amazon.com.br"
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-Amz-Date": new Date().toISOString()
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  const item = data.ItemsResult.Items[0];

  // Monta o card
  res.send(`
    <div class="product-card">
      <img src="${item.Images.Primary.Medium.URL}" alt="${item.ItemInfo.Title.DisplayValue}">
      <h3>${item.ItemInfo.Title.DisplayValue}</h3>
      <p class="price">${item.Offers.Listings[0].Price.DisplayAmount}</p>
      
      <a href="${item.DetailPageURL}" target="_blank" class="buy-btn">
        Comprar na Amazon
      </a>

      <a href="/analises/${asin}" class="review-btn">
        Ver análise dos especialistas
      </a>
    </div>
  `);
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
