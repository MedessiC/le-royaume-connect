export const emailTemplates = {
  verifyEmail: (verificationLink: string, userName: string) => ({
    subject: 'Confirmez votre adresse email - Le Règne Millénaire',
    html: `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">Bienvenue!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            Bonjour <strong>${userName}</strong>,
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
            Merci de vous être inscrit sur Le Règne Millénaire. Pour confirmer votre adresse email et activer votre compte, veuillez cliquer sur le bouton ci-dessous.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); color: white; padding: 12px 40px; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 16px;">
              Confirmer mon email
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 30px 0 0 0;">
            Ce lien expirera dans 24 heures. Si vous n'avez pas créé ce compte, ignorez cet email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © 2026 Le Règne Millénaire. Tous droits réservés.
          </p>
        </div>
      </div>
    `,
    text: `
Bienvenue!

Bonjour ${userName},

Merci de vous être inscrit sur Le Règne Millénaire. Pour confirmer votre adresse email, cliquez sur le lien ci-dessous:

${verificationLink}

Ce lien expirera dans 24 heures.

© 2026 Le Règne Millénaire
    `.trim(),
  }),

  resetPassword: (resetLink: string, userName: string) => ({
    subject: 'Réinitialisez votre mot de passe - Le Règne Millénaire',
    html: `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">Réinitialisation de mot de passe</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            Bonjour <strong>${userName}</strong>,
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
            Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #DC2626; color: white; padding: 12px 40px; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 16px;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 30px 0 0 0;">
            Ce lien expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © 2026 Le Règne Millénaire. Tous droits réservés.
          </p>
        </div>
      </div>
    `,
    text: `
Réinitialisation de mot de passe

Bonjour ${userName},

Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le lien ci-dessous:

${resetLink}

Ce lien expirera dans 1 heure.

© 2026 Le Règne Millénaire
    `.trim(),
  }),

  paymentConfirmation: (
    amount: number,
    phoneNumber: string,
    transactionId: string,
    userName: string
  ) => ({
    subject: 'Confirmation de donation - Le Règne Millénaire',
    html: `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">✓ Donation reçue</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            Bonjour <strong>${userName}</strong>,
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
            Merci pour votre généreuse donation! Voici un résumé de votre transaction:
          </p>
          
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 5px; padding: 20px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-weight: 600;">Montant:</span>
              <span style="color: #374151; font-weight: 700; font-size: 18px;">${amount.toLocaleString('fr-FR')} XOF</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280;">Téléphone:</span>
              <span style="color: #374151;">${phoneNumber}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 0;">
              <span style="color: #6b7280;">ID Transaction:</span>
              <span style="color: #374151; font-family: monospace;">${transactionId}</span>
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
            Votre contribution nous aide à continuer notre mission. Merci de votre soutien!
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © 2026 Le Règne Millénaire. Tous droits réservés.
          </p>
        </div>
      </div>
    `,
    text: `
Donation reçue

Bonjour ${userName},

Merci pour votre donation!

Montant: ${amount.toLocaleString('fr-FR')} XOF
Téléphone: ${phoneNumber}
ID Transaction: ${transactionId}

Votre contribution nous aide à continuer notre mission.

© 2026 Le Règne Millénaire
    `.trim(),
  }),

  welcomeNewsletter: (userName: string, unsubscribeLink: string) => ({
    subject: 'Bienvenue dans notre newsletter - Le Règne Millénaire',
    html: `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">Bienvenue!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            Bonjour <strong>${userName}</strong>,
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            Vous êtes maintenant abonné à notre newsletter! Vous recevrez désormais:
          </p>
          
          <ul style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 20px 0 20px 20px; padding: 0;">
            <li>📚 Les derniers enseignements</li>
            <li>🎥 Vidéos exclusives</li>
            <li>📰 Actualités du mouvement</li>
            <li>🎉 Événements spéciaux</li>
          </ul>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
            Vous pouvez modifier vos préférences d'email à tout moment.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            <a href="${unsubscribeLink}" style="color: #9ca3af; text-decoration: none;">Se désabonner</a> • 
            © 2026 Le Règne Millénaire
          </p>
        </div>
      </div>
    `,
    text: `
Bienvenue dans notre newsletter!

Bonjour ${userName},

Vous êtes maintenant abonné à notre newsletter!

Vous recevrez:
- Les derniers enseignements
- Vidéos exclusives
- Actualités du mouvement
- Événements spéciaux

${unsubscribeLink}

© 2026 Le Règne Millénaire
    `.trim(),
  }),

  notificationDigest: (userName: string, notifications: any[]) => ({
    subject: 'Votre digest hebdomadaire - Le Règne Millénaire',
    html: `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">Votre Digest Hebdomadaire</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
            Bonjour <strong>${userName}</strong>,
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
            Voici ce que vous avez manqué cette semaine:
          </p>
          
          ${notifications
            .map(
              (notif) => `
            <div style="background: white; border-left: 4px solid #8B5CF6; padding: 15px; margin: 15px 0; border-radius: 3px;">
              <p style="color: #374151; font-weight: 600; margin: 0 0 5px 0;">${notif.title}</p>
              <p style="color: #6b7280; font-size: 13px; margin: 0;">${notif.description}</p>
            </div>
          `
            )
            .join('')}
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © 2026 Le Règne Millénaire. Tous droits réservés.
          </p>
        </div>
      </div>
    `,
    text: `
Votre Digest Hebdomadaire

Bonjour ${userName},

Voici ce que vous avez manqué cette semaine:

${notifications.map((n) => `- ${n.title}: ${n.description}`).join('\n')}

© 2026 Le Règne Millénaire
    `.trim(),
  }),
};
