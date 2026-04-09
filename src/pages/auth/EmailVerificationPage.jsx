import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { AuthContext } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const RESEND_COOLDOWN = 60; // seconds

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const { user, resendVerificationEmail, updateEmailVerified } = useContext(AuthContext);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const pollRef = useRef(null);
  const cooldownRef = useRef(null);

  // Poll Firebase every 5 seconds to detect when user verifies their email
  useEffect(() => {
    const auth = getAuth();

    const checkVerification = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          clearInterval(pollRef.current);
          updateEmailVerified();
          toast.success('Email vérifié ! Bienvenue !');
          navigate('/', { replace: true });
        }
      } catch {
        // Ignore transient reload errors
      }
    };

    pollRef.current = setInterval(checkVerification, 5000);
    return () => clearInterval(pollRef.current);
  }, [navigate]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(cooldownRef.current);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || sending) return;
    setSending(true);
    const result = await resendVerificationEmail();
    setSending(false);
    if (result.success) {
      setCooldown(RESEND_COOLDOWN);
    }
  };

  const email = user?.email || getAuth().currentUser?.email || '';

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/60 p-8">
        <div className="text-center">
          {/* Envelope icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
            <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérifiez votre email</h2>

          <p className="text-gray-600 mb-2">
            Un lien de vérification a été envoyé à :
          </p>
          {email && (
            <p className="font-semibold text-gray-800 mb-4 break-all">{email}</p>
          )}
          <p className="text-sm text-gray-500 mb-6">
            Cliquez sur le lien dans l'email pour activer votre compte.
            Cette page se mettra à jour automatiquement une fois votre email vérifié.
          </p>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || sending}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold mb-3 shadow-glow-primary"
          >
            {sending
              ? 'Envoi en cours…'
              : cooldown > 0
              ? `Renvoyer l'email (${cooldown}s)`
              : "Renvoyer l'email de vérification"}
          </button>

          <p className="text-xs text-gray-400 mb-6">
            Vérifiez également votre dossier spam si vous ne trouvez pas l'email.
          </p>

          {/* Live polling indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span className="inline-block h-2 w-2 rounded-full bg-primary-400 animate-pulse" />
            En attente de vérification…
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
