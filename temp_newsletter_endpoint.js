  // Newsletter subscription with advanced preferences
  app.post("/api/newsletter/subscribe-advanced", async (req, res) => {
    try {
      const validatedData = insertNewsletterAdvancedSchema.parse(req.body);
      const subscription = await storage.createNewsletterAdvanced(validatedData);
      
      // Broadcast to admin dashboard for real-time notifications
      sseManager.broadcast({
        type: 'newsletter-subscription',
        data: {
          email: subscription.email,
          name: subscription.name,
          categories: subscription.interests?.categories || [],
          timestamp: new Date().toISOString()
        }
      });
      
      res.status(201).json(subscription);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Dados inválidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Falha ao se inscrever na newsletter" });
      }
    }
  });