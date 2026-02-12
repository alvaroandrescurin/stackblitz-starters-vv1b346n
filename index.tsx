
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

//Vibe coded by ammaar@google.com

import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import ForestNightBackground from './components/ForestNightBackground';

type Locale = 'en-US' | 'es-ES' | 'es-LA' | 'ja-JP' | 'fr-FR' | 'it-IT' | 'pt-BR' | 'ru-RU' | 'zh-CN';

const LANG_LABELS: Record<Locale, string> = {
    'en-US': 'EN',
    'es-ES': 'ES',
    'es-LA': 'LA',
    'ja-JP': 'JA',
    'fr-FR': 'FR',
    'it-IT': 'IT',
    'pt-BR': 'PT',
    'ru-RU': 'RU',
    'zh-CN': 'ZH'
};

const GOTHIC_PHRASES = [
    "In umbra veritas, in nocte aeternitas",
    "तमसो मा ज्योतिर्गमय",
    "Nox est aeterna, vita brevis",
    "सर्वं क्षणिकम्",
    "Memento quia pulvis es",
    "मृत्युः सर्वं हरति",
    "Post tenebras lux - Kala prabhavati",
    "Umbrae nos sequuntur",
    "अस्माकं अन्धकारः सत्यम्"
];

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
    'en-US': { title: 'Umbrae', enter: 'Enter', settings: 'Settings', exit: 'Exit', brightness: 'Brightness', confirmExit: 'Are you sure?', yes: 'Yes', no: 'No' },
    'es-ES': { title: 'Umbrae', enter: 'Entrar', settings: 'Configuraciones', exit: 'Salir', brightness: 'Brillo', confirmExit: '¿Estás seguro?', yes: 'Sí', no: 'No' },
    'es-LA': { title: 'Umbrae', enter: 'Entrar', settings: 'Configuraciones', exit: 'Salir', brightness: 'Brillo', confirmExit: '¿Estás seguro?', yes: 'Sí', no: 'No' },
    'ja-JP': { title: 'Umbrae', enter: '入る', settings: '設定', exit: '終了', brightness: '明るさ', confirmExit: '本当によろしいですか？', yes: 'はい', no: 'いいえ' },
    'fr-FR': { title: 'Umbrae', enter: 'Entrer', settings: 'Paramètres', exit: 'Quitter', brightness: 'Luminosité', confirmExit: 'Êtes-vous sûr ?', yes: 'Oui', no: 'Non' },
    'it-IT': { title: 'Umbrae', enter: 'Entra', settings: 'Impostazioni', exit: 'Esci', brightness: 'Luminosità', confirmExit: 'Sei sicuro?', yes: 'Sì', no: 'No' },
    'pt-BR': { title: 'Umbrae', enter: 'Entrar', settings: 'Configurações', exit: 'Sair', brightness: 'Brilho', confirmExit: 'Você tem certeza?', yes: 'Sim', no: 'Não' },
    'ru-RU': { title: 'Umbrae', enter: 'Войти', settings: 'Настройки', exit: 'Выйти', brightness: 'Яркость', confirmExit: 'Вы уверены?', yes: 'Да', no: 'Нет' },
    'zh-CN': { title: 'Umbrae', enter: '进入', settings: '设置', exit: '退出', brightness: '亮度', confirmExit: '你确定吗？', yes: '是', no: '否' }
};

function App() {
  const [locale, setLocale] = useState<Locale>('es-LA');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  
  // Phrase logic with Glitch
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [glitchTrigger, setGlitchTrigger] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
        setGlitchTrigger(true);
        setTimeout(() => {
            setPhraseIndex(prev => (prev + 1) % GOTHIC_PHRASES.length);
            setGlitchTrigger(false);
        }, 200);
    }, 3300);
    return () => clearInterval(interval);
  }, []);

  const t = (key: string) => (TRANSLATIONS[locale] && TRANSLATIONS[locale][key]) || TRANSLATIONS['en-US'][key] || key;

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
              setShowLangMenu(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFinalExit = () => {
    setIsTerminated(true);
    // Attempt to close window, though most browsers block this if not opened via script
    setTimeout(() => {
        window.close();
        // Fallback: refresh or clear screen
        window.location.href = "about:blank";
    }, 1000);
  };

  if (isTerminated) {
      return (
          <div className="terminated-screen">
              <ForestNightBackground />
              <div className="terminated-content">
                  <p>Umbrae Clausa Est</p>
              </div>
          </div>
      );
  }

  return (
    <>
        <div 
            className="brightness-overlay" 
            style={{ opacity: 1 - (brightness / 100), pointerEvents: 'none' }} 
        />

        <div className="immersive-app">
            <ForestNightBackground />

            {/* Language Selection in Top-Left */}
            <div className="lang-corner-container" ref={langMenuRef}>
                <button className="lang-btn-small" onClick={() => setShowLangMenu(!showLangMenu)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    {LANG_LABELS[locale]}
                </button>
                {showLangMenu && (
                    <div className="lang-dropdown corner-dropdown">
                        {(Object.keys(LANG_LABELS) as Locale[]).map((l) => (
                            <button key={l} className={`lang-option ${locale === l ? 'active' : ''}`} onClick={() => { setLocale(l); setShowLangMenu(false); }}>
                                {LANG_LABELS[l]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="stage-container">
                 <div className="empty-state">
                     <div className="empty-content">
                         <h1>{t('title')}</h1>
                         <div className="subtitle-container">
                             <p className={`gothic-subtitle ${glitchTrigger ? 'glitch' : ''}`}>
                                {GOTHIC_PHRASES[phraseIndex]}
                             </p>
                         </div>
                         
                         <div className="start-menu-stack">
                            <button className="menu-button highlight">
                                {t('enter')}
                            </button>
                            <button className="menu-button" onClick={() => {}}>
                                {t('settings')}
                            </button>
                            <button className="menu-button" onClick={() => setIsExitConfirmOpen(true)}>
                                {t('exit')}
                            </button>

                            <div className="brightness-stack-bar">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                                <input 
                                    type="range" 
                                    min="20" 
                                    max="100" 
                                    value={brightness} 
                                    onChange={(e) => setBrightness(parseInt(e.target.value))} 
                                    className="menu-brightness-slider"
                                />
                            </div>
                         </div>
                     </div>
                 </div>
            </div>

            {isExitConfirmOpen && (
                <div className="exit-confirm-overlay">
                    <div className="exit-confirm-card">
                        <p>{t('confirmExit')}</p>
                        <div className="exit-confirm-actions">
                            <button className="confirm-btn yes" onClick={handleFinalExit}>{t('yes')}</button>
                            <button className="confirm-btn no" onClick={() => setIsExitConfirmOpen(false)}>{t('no')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
