
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

//Vibe coded by ammaar@google.com

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import AtmosphericBackground from './components/AtmosphericBackground';
import FireEmbers from './components/FireEmbers';

type Locale = 'en-US' | 'es-ES' | 'es-LA' | 'ja-JP' | 'fr-FR' | 'it-IT' | 'pt-BR' | 'ru-RU' | 'zh-CN';
type AppView = 'home' | 'content' | 'settings';
type StorySequence = 'init' | 'fade-in' | 'scrolling' | 'fade-out' | 'waiting' | 'wake-up';

const LANG_LABELS: Record<Locale, string> = {
    'en-US': 'EN', 'es-ES': 'ES', 'es-LA': 'LA', 'ja-JP': 'JA', 'fr-FR': 'FR', 'it-IT': 'IT', 'pt-BR': 'PT', 'ru-RU': 'RU', 'zh-CN': 'ZH'
};

const GOTHIC_PHRASES = [
    "In umbra veritas, in nocte aeternitas", "तमसो मा ज्योतिर्गमय", "Nox est aeterna, vita brevis",
    "सर्वं क्षणिकम्", "Memento quia pulvis es", "मृतyuः सर्वं harti",
    "Post tenebras lux - Kala prabhavati", "Umbrae nos sequuntur", "अस्माकं अन्धकारः सत्यम्"
];

const THE_STORY = `Uno era en el principio y tres a la vez.
Este uno era llamado Luz y dio nombre similares a otros tres.
Lucero, Alba y Amanecer fueron los nuevos tres nacidos de Él.
De esta forma Él pudo descansar y los tres continuaron la labor.
Para poder así en un nuevo ciclo retomar la vida nacida de Él.
Antes de dormir, su palabra tomó forma y la forma acción y la acción movimiento y esta fue llamada Ruaj y durante un tiempo la labor fue constante pero el Caos influyó tomando a uno de los tres dando origen al desorden que fue llamado Noum…
El Caos era inteligente y con susurros contaminó de muchas formas el corazón del caído hasta convencerle de que llamara a su lado a los 100 a su cargo…
El 0 contaminó al 1 y el uno a sus 100 y estos contaminaron a miles y esos miles a millones haciendo que la cuenta se perdiera más y más.
Una guerra se desató entre el bando del caído contra el de sus hermanos por el control de la creación…
100 días la guerra tomó, 100 almas la guerra tomó, pero miles de lágrimas generó
Y cuando la última criatura tocó el suelo, como un rayo fueron todos arrojados al más joven de los mundos por derecho de posesión…
Y como si fuera una canción, sellos se pusieron en torno a las grietas que la caída provocó, por boca de quienes en esa contienda mirando con lágrimas a sus hermanos caídos, se habían alzado en victoria por la paz presunta, que la creación pedía con gran devoción…

Esta historia fue contada por generaciones de generaciones, siendo un eco del inicio de todo como base de las diferentes sociedades y el alba de este; lo que eventualmente dio origen a ciudades estado y reinos con variadas culturas, en un mundo que reponía fuerzas por la lluvia de almas que antaño cayó. Así, en el afán de evitar que las sombras tomaran el control, differentes pueblos y grupos que guardaban los pilares y sus sellos fueron creciendo cada vez más y más, pero así como en cualquier cultura el paso de las generaciones hizo mella en las tradiciones y estas lentamente fueron relegadas a simples mitos o cuentos de ancianas que distaban de los problemas más visibles y comunes de cualquier sociedad en vías de crecimiento, dando así lugar a que solo unos pocos y reducidos grupos guardaran sus votos, siento Masdar, el lugar que marcaría por esta razón, la historia de la humanidad y poniendo un punto y aparte en el gran mundo Edoin.
El imperio de Masdar fue la cuna de muchos reyes tanto sabios como buenos que atendían a las tradiciones y tenían el favor de la gente, pero esto no evitó que una gran guerra asolara esa zona proveniente de una isla en el norte. El Triunvirato de Kat prendió la mecha del conflicto que por generaciones marcó una tensión en la zona dando lugar a pequeñas escaramuzas y conflictos que se transformaron en batallas cruentas y muy duraderas. El rey Sar´n Saleh, en el afán de dar ánimos a su ejército en un envite, dirigió personalmente las fuerzas de Masdar dando lugar a grandes victorias pero nadie tiene la vida comprada y si tientas a la muerte eventualmente esta te va a reclamar y así fue, siendo este atravesado por una lanza y una lluvia de flechas, cayendo muerto a los pocos minutos de una batalla que ya había costado la vida de cientos de Masdires frente a las puertas del último bastión fronterizo de la nación, dejando así a su imperio sin una cabeza que los dirigiera. Sar al no tener un heredero ya que su esposa no podía darle hijos ni hijas dejaba el trono vacío, por lo que para ocupar este lugar y tener un líder en esta fatídica hora, el puesto pasó a manos de su hermano menor, pero este no era un hombre muy dado a las tradiciones, así que lentamente fue alejándolas de la sociedad porque lo importante ahora, era ganar la guerra que ya había traspasado sus fronteras.
Los años pasaron y con estos, una guerra que costaba cada vez más vidas así como recursos que el mismo reino disponía, por lo que sucedió lo más lógico, para poder avanzar de forma favorable en el conflicto, el otrora gran general de los ejércitos, Jora ́n Saleh, alejó definitivamente a los sacerdotes que tenía como consejeros y acercó a sus oídos a las grandes mentes militares de su época y junto a ellas decidió ver si las leyendas eran ciertas y si así lo fuesen, usar el poder que se encontraba sellado bajo su trono en pos de la victoria, un poder que se hallaba en lo más oscuro de las criptas reales. El antiguo Sello del Escorpión.
Jora, bajó con sus hombres más cercanos las escaleras tras el trono, pasando los cuerpos de sus antepasados y llegando así hasta el primer rey ahí sepultado, Masdr´n Saleh. El Escorpión de las arenas rojas. Jora, trago hondo, tomó una antorcha de manos de uno de sus hombres y camino al sarcofago… Allí, el joven Rey limpio la superficie de este y abrio el sarcofago. Las manos del cuerpo estaban sobre su pecho y algo extraño resguardado por estas. Un collar, uno el cual tenía una forma precisa para encajar en un agujero situado en la gran puerta tras este, así que este. lo tomó y con ímpetu y mucha seguridad abrió la gran puerta sin pensar en nada más que terminar esta guerra…
Cientos de almas cayeron ese día y el imperio de Masdar cayó con estas así como los ejércitos del Triunvirato que horas atrás le acechaban... 
Desde el sur al norte, todo el continente fue sumido en plagas de sangre que se extendieron por los mares llegando a cada confín del planeta desatando guerras en cada reino, imperio y fuerza que hallaba. Edoín estaba por caer y con este sociedades enteras se perdieron de la faz de este mundo, pero no fue el fin de las vidas en este planeta ya que habiendo pasado decadas y decadas varios héroes liderados por Drasklor caminante de las aguas y Lav de Jade que tras muchas dificultades pudieron crear nuevos sellos para la mayoría de plagas que estaban libres asolando las tierras, relegando a los que no pudieron sellar a esconderse en las sombras y escondrijos del mundo.
Así, la tierra nuevamente tuvo una relativa paz, pero ésta estaba muy herida y donde antes habían gloriosos reinos, ahora habían cenizas y donde antes habían lagos ahora páramos desérticos y donde antes había vida ahora solo muerte se encontraba dando lugar a una época en donde el mundo titubeaba entre morir o lograr salir adelante pero cuando ya las generaciones que conocían los secretos de la guerra habían perecido por el tiempo, las antiguas sombras escondidas comenzaron a mostrar sus dientes y el caos comenzó lentamente a reinar creciendo niños con rumores de guerras a la distancia, pueblos cayendo a la espada de grupos que necesitaban sus recursos y razas exterminadas por completo, siendo ahora, el momento más lúguubre para estar ya que los héroes de antaño se habían perdido en el tiempo y los secretos del pasado se habían esfamado casi al completo con estos. 
El tiempo pasó y esta se volvió la nueva normalidad llevándonos lentamente 1600 años al futuro, posando nuestra mirada a un pequeño pueblo en el norte del continente mayor, en el día primero del mes y a la hora más oscura de la noche…`;

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
    'en-US': { title: 'Umbrae', enter: 'Enter', settings: 'Settings', exit: 'Exit', brightness: 'Brightness', confirmExit: 'Are you sure?', yes: 'Yes', no: 'No', home: 'Home', welcome: 'Welcome', wakeUp: 'Wake up', name: 'Character Name', fontSize: 'Font Size', fontType: 'Font Type', colorTheme: 'Interface Color', small: 'Small', medium: 'Medium', large: 'Large' },
    'es-ES': { title: 'Umbrae', enter: 'Entrar', settings: 'Configuraciones', exit: 'Salir', brightness: 'Brillo', confirmExit: '¿Estás seguro?', yes: 'Sí', no: 'No', home: 'Inicio', welcome: 'Bienvenido', wakeUp: 'Despierta', name: 'Nombre del Personaje', fontSize: 'Tamaño de Letra', fontType: 'Tipo de Letra', colorTheme: 'Color de Interfaz', small: 'Pequeño', medium: 'Mediano', large: 'Grande' },
    'es-LA': { title: 'Umbrae', enter: 'Entrar', settings: 'Configuraciones', exit: 'Salir', brightness: 'Brillo', confirmExit: '¿Estás seguro?', yes: 'Sí', no: 'No', home: 'Inicio', welcome: 'Bienvenido', wakeUp: 'Despierta', name: 'Nombre del Personaje', fontSize: 'Tamaño de Letra', fontType: 'Tipo de Letra', colorTheme: 'Color de Interfaz', small: 'Pequeño', medium: 'Mediano', large: 'Grande' },
    'ja-JP': { title: 'Umbrae', enter: '入る', settings: '設定', exit: '終了', brightness: '明るさ', confirmExit: '本当によろしいですか？', yes: 'はい', no: 'いいえ', home: 'スタート', welcome: 'ようこそ', wakeUp: '目を覚まして', name: 'キャラクター名', fontSize: 'フォントサイズ', fontType: 'フォントの種類', colorTheme: 'インターフェースの色', small: '小', medium: '中', large: '大' },
    'fr-FR': { title: 'Umbrae', enter: 'Entrer', settings: 'Paramètres', exit: 'Quitter', brightness: 'Luminosité', confirmExit: 'Êtes-vous sûr ?', yes: 'Oui', no: 'Non', home: 'Accueil', welcome: 'Bienvenue', wakeUp: 'Réveille-toi', name: 'Nom del Personnage', fontSize: 'Taille de Police', fontType: 'Type de Police', colorTheme: 'Couleur d\'Interface', small: 'Petit', medium: 'Moyen', large: 'Grand' },
    'it-IT': { title: 'Umbrae', enter: 'Entra', settings: 'Impostazioni', exit: 'Esci', brightness: 'Luminosità', confirmExit: 'Sei sicuro?', yes: 'Sì', no: 'No', home: 'Inizio', welcome: 'Benvenuto', wakeUp: 'Svegliati', name: 'Nombre del Personaggio', fontSize: 'Dimensione Carattere', fontType: 'Tipo Carattere', colorTheme: 'Colore Interfaccia', small: 'Piccolo', medium: 'Medio', large: 'Grande' },
    'pt-BR': { title: 'Umbrae', enter: 'Entrar', settings: 'Configurações', exit: 'Sair', brightness: 'Brilho', confirmExit: 'Você tem certeza?', yes: 'Sim', no: 'Não', home: 'Início', welcome: 'Bienvenida', wakeUp: 'Acorde', name: 'Nombre del Personagem', fontSize: 'Tamanho da Letra', fontType: 'Tipo de Letra', colorTheme: 'Cor da Interface', small: 'Pequeno', medium: 'Médio', large: 'Grande' },
    'ru-RU': { title: 'Umbrae', enter: 'Войти', settings: 'Настройки', exit: 'Выйти', brightness: 'Яркость', confirmExit: 'Вы уверены?', yes: 'Да', no: 'Нет', home: 'Главная', welcome: 'Добро пожаловать', wakeUp: 'Проснись', name: 'Имя персонажа', fontSize: 'Размер шрифта', fontType: 'Тип шрифта', colorTheme: 'Цвет интерфейса', small: 'Маленький', medium: 'Средний', large: 'Большой' },
    'zh-CN': { title: 'Umbrae', enter: '进入', settings: '设置', exit: '退出', brightness: '亮度', confirmExit: '你确定吗？', yes: '是', no: '否', home: '首页', welcome: '欢迎', wakeUp: '醒来', name: '角色名称', fontSize: '字体大小', fontType: '字体类型', colorTheme: '界面颜色', small: '小', medium: '中', large: '大' }
};

function App() {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('umbrae_locale') as Locale) || 'es-LA');
  const [userName, setUserName] = useState(() => localStorage.getItem('umbrae_username') || '');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('umbrae_font_size') || 'medium');
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('umbrae_font_family') || 'sans');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('umbrae_accent_color') || '#020205');

  const [view, setView] = useState<AppView>('home');
  const [storySeq, setStorySeq] = useState<StorySequence>('init');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [glitchTrigger, setGlitchTrigger] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const rafRef = useRef<number>(null);
  const storySeqRef = useRef<StorySequence>('init');

  useEffect(() => {
    localStorage.setItem('umbrae_locale', locale);
    localStorage.setItem('umbrae_username', userName);
    localStorage.setItem('umbrae_font_size', fontSize);
    localStorage.setItem('umbrae_font_family', fontFamily);
    localStorage.setItem('umbrae_accent_color', accentColor);

    const root = document.documentElement;
    root.style.setProperty('--app-bg', accentColor);
    let fSize = '16px';
    if (fontSize === 'small') fSize = '14px';
    if (fontSize === 'large') fSize = '20px';
    root.style.setProperty('--base-font-size', fSize);
    let fFamily = "'Inter', sans-serif";
    if (fontFamily === 'serif') fFamily = "'Playfair Display', serif";
    if (fontFamily === 'mono') fFamily = "'Roboto Mono', monospace";
    root.style.setProperty('--font-sans', fFamily);
  }, [locale, userName, fontSize, fontFamily, accentColor]);

  // Handle manual scroll synchronization
  const handleScroll = () => {
    if (scrollRef.current && (storySeqRef.current === 'scrolling' || storySeqRef.current === 'fade-in')) {
        scrollPosRef.current = scrollRef.current.scrollTop;
    }
  };

  // Cinematic Controller
  useEffect(() => {
    if (view === 'content') {
        scrollPosRef.current = 0;
        storySeqRef.current = 'init';
        setStorySeq('init');

        // Cinematic transition: Nothing for 100ms, then fade-in AND scrolling together
        const triggerTimeout = setTimeout(() => {
            storySeqRef.current = 'fade-in';
            setStorySeq('fade-in');
        }, 100);

        const animateScroll = () => {
            if (scrollRef.current && (storySeqRef.current === 'fade-in' || storySeqRef.current === 'scrolling')) {
                const el = scrollRef.current;
                
                // Increment scroll position for upward movement
                scrollPosRef.current += 0.8; 
                el.scrollTop = Math.floor(scrollPosRef.current);

                // Check if scroll reached the bottom (end of the story)
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
                    storySeqRef.current = 'fade-out';
                    setStorySeq('fade-out');
                } else {
                    rafRef.current = requestAnimationFrame(animateScroll);
                }
            } else if (storySeqRef.current === 'init') {
                rafRef.current = requestAnimationFrame(animateScroll);
            }
        };

        rafRef.current = requestAnimationFrame(animateScroll);

        return () => {
            clearTimeout(triggerTimeout);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    } else {
        storySeqRef.current = 'init';
        setStorySeq('init');
    }
  }, [view]);

  // Handle sequence progression after scroll ends
  useEffect(() => {
      if (storySeq === 'fade-out') {
          // The CSS fade-out takes 2 seconds. 
          // We wait 2s (fade duration) + 1s (requested extra delay) = 3s total.
          const wakeTimeout = setTimeout(() => {
              storySeqRef.current = 'wake-up';
              setStorySeq('wake-up');
          }, 3000); 

          return () => {
              clearTimeout(wakeTimeout);
          };
      }
  }, [storySeq]);

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
    setTimeout(() => {
        window.close();
        window.location.href = "about:blank";
    }, 1000);
  };

  const displayName = userName.trim() || 'June';

  if (isTerminated) {
      return (
          <div className="terminated-screen">
              <AtmosphericBackground />
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
            <AtmosphericBackground />
            {(view === 'content' || view === 'home') && <FireEmbers />}

            <div className="top-left-controls">
                {view !== 'home' && (
                    <button className="lang-btn-small" onClick={() => setView('home')} style={{ marginRight: '8px' }}>
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                         {t('home')}
                    </button>
                )}
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
            </div>

            <div className="stage-container">
                 {view === 'home' && (
                     <div className="empty-state">
                         <div className="empty-content">
                             {userName && (
                                 <div className="personal-greeting">
                                     {t('welcome')}, {userName}
                                 </div>
                             )}
                             <h1>{t('title')}</h1>
                             <div className="subtitle-container">
                                 <p className={`gothic-subtitle ${glitchTrigger ? 'glitch' : ''}`}>
                                    {GOTHIC_PHRASES[phraseIndex]}
                                 </p>
                             </div>
                             
                             <div className="start-menu-stack">
                                <button className="menu-button highlight" onClick={() => { setView('content'); }}>
                                    {t('enter')}
                                </button>
                                <button className="menu-button" onClick={() => setView('settings')}>
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
                 )}
                 {view === 'content' && (
                     <div className="empty-state story-view">
                         <div 
                            className={`story-scroll-container ${storySeq === 'init' ? 'hidden' : (storySeq === 'fade-out' || storySeq === 'wake-up') ? 'fade-out' : 'fade-in'}`} 
                            ref={scrollRef}
                            onScroll={handleScroll}
                         >
                            <div className="story-content centered">
                                <div className="story-start-spacer" />
                                <h1 className="prologo-header">Prologo</h1>
                                {THE_STORY.split('\n').map((line, i) => (
                                    <p key={i}>{line || '\u00A0'}</p>
                                ))}
                                <div className="story-end-spacer" />
                            </div>
                         </div>

                         {storySeq === 'wake-up' && (
                             <div className="wake-up-overlay">
                                 <h2 className="wake-up-text">
                                     {t('wakeUp')}, {displayName}
                                 </h2>
                             </div>
                         )}
                     </div>
                 )}
                 {view === 'settings' && (
                     <div className="empty-state settings-view">
                         <div className="settings-card">
                             <div className="settings-field">
                                 <label>{t('name')}</label>
                                 <input 
                                    type="text" 
                                    value={userName} 
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="..."
                                 />
                             </div>
                             <div className="settings-field">
                                 <label>{t('fontSize')}</label>
                                 <div className="settings-options">
                                     {['small', 'medium', 'large'].map(s => (
                                         <button key={s} className={`option-btn ${fontSize === s ? 'active' : ''}`} onClick={() => setFontSize(s)}>{t(s)}</button>
                                     ))}
                                 </div>
                             </div>
                             <div className="settings-field">
                                 <label>{t('fontType')}</label>
                                 <div className="settings-options">
                                     {['sans', 'serif', 'mono'].map(f => (
                                         <button key={f} className={`option-btn ${fontFamily === f ? 'active' : ''}`} onClick={() => setFontFamily(f)}>{f.toUpperCase()}</button>
                                     ))}
                                 </div>
                             </div>
                             <div className="settings-field">
                                 <label>{t('colorTheme')}</label>
                                 <div className="color-options">
                                     {['#020205', '#0a192f', '#1a0b2e', '#1a1a1a'].map(c => (
                                         <button key={c} className={`color-bubble ${accentColor === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => setAccentColor(c)} />
                                     ))}
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}
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
