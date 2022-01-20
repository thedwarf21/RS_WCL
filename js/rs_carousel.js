/**
 * Merci à Florian BAUDRY pour sa participation au développement de ce composant, dans le cadre de son stage en immersion pré-formation
 */

// Constantes spécifiques à ce composant
const PAD_MARGIN = 0.5;
const PAD_SIZE = 1;
const DEFAULT_TEMPO = 5000;
const DEFAULT_HEIGHT = "20vw";
const DEFAULT_DIRECTION = "column";

//---------------------------------------------------------------------------------------------------
//                      Affichage de news animées avec sélecteur de contenu
//---------------------------------------------------------------------------------------------------
/* Usage JS Uniquement */
class RS_Carousel extends HTMLDivElement {

  /**********************************************************************************
   * Constructeur par défaut                                                        *
   **********************************************************************************
   * @param | {string} | css_height | Hauteur composant au format CSS               *
   * @param | {number} | tempo      | Temporisation (en ms) pour le défilement auto *
   * @param | {Array}  | contents   | Liste des DOM de contenus                     *
   **********************************************************************************/
  constructor(css_height, tempo, contents) {
    
    // Création des bases structurelles du composant
    super();
    this.classList.add("rs-carousel");
    this.style.height = css_height || DEFAULT_HEIGHT;
    this.addEventListener('mouseenter', ()=> { this.deleteTimer(); });
    this.addEventListener('mouseleave', ()=> { this.createTimer(); });

    // wrapper de contenu (enveloppe les contenus à faire défiler)
    this.content_wrapper = document.createElement("DIV");
    this.content_wrapper.classList.add("rs-carousel-content");
    this.appendChild(this.content_wrapper);

    // Les pads de sélection du contenu actif (enveloppe et lightener)
    let pads_aligner = document.createElement("DIV");
    pads_aligner.classList.add("rs-pads-container");
    this.appendChild(pads_aligner);
    this.pads_container = document.createElement("DIV");
    this.pads_container.classList.add("rs-pads-sub-container");
    pads_aligner.appendChild(this.pads_container);
    this.pad_lightener = document.createElement("DIV");
    this.pad_lightener.classList.add("rs-pad-lightener");
    this.pads_container.appendChild(this.pad_lightener);

    // Propriétés de travail
    this.tempo = tempo || DEFAULT_TEMPO;
    this.contents = contents || [];
    this.active = 0;
    this.injectContentsAndPads();
    this.selectContent(0);
  }

  /*****************************************************************
   * Parcourt les contenus listés et crée les éléments (div + pad) *
   *****************************************************************/
  injectContentsAndPads() {
    for (let i = 0; i < this.contents.length; i++) {
      let content = this.contents[i];
      let pad = document.createElement("DIV");
      pad.classList.add("rs-pad");
      pad.addEventListener('click', ()=> { this.selectContent(i, true); });
      this.pads_container.appendChild(pad);
      this.content_wrapper.appendChild(content);
    }
  }

  /********************************************************************************************
   * Sélectionne un contenu, en fonction de son indice                                        *
   ********************************************************************************************
   * @param | {number}  | content_index | Indice du contenu sélectionné                       *
   * @param | {boolean} | keepFrozen    | Permet de bloquer le redémarrage du défilement auto *
   ********************************************************************************************/
  selectContent(content_index, keepFrozen) {
    this.contents[this.active].classList.remove("active");
    this.active = content_index;
    this.contents[content_index].classList.add("active");
    this.moveLightener();

    // Gestion du timer de rotation automatique de contenu
    if (this.timer)
      this.deleteTimer();
    if (!keepFrozen)
      this.createTimer();
  }

  /***************************************************
   * Fonctions de gestion du timer (défilement auto) *
   ***************************************************/
  createTimer() { 
    if (!this.timer) 
      this.timer = setTimeout(()=> { this.nextContent(); }, this.tempo); 
  }
  deleteTimer() { 
    clearTimeout(this.timer); 
    this.timer = null;
  }

  /********************************************************************************************
   * Opère un déplacement du "lightener" indiquant le contenu actif, sur le pad correspondant *
   ********************************************************************************************/
  moveLightener() { this.pad_lightener.style.left = (PAD_MARGIN + this.active * (PAD_SIZE + 2 * PAD_MARGIN)) + "vw"; }

  /********************************************
   * Passe automatiquement au contenu suivant *
   ********************************************/
  nextContent() {
    if (this.active + 1 < this.contents.length)
      this.selectContent(this.active + 1);
    else this.selectContent(0);
  }
}
customElements.define('rs-wcl-carousel', RS_Carousel, { extends: 'div' });

/* Usage HTML uniquement */
class RSWCLCarousel extends HTMLBaseElement {

  /*******************************************************************
   * Constructeur: appeler simplement le constructeur de HTMLElement *
   *******************************************************************/
  constructor() { super(); }

  /*************************************************
   * S'exécute lors de l'ajout du composant au DOM *
   *************************************************/
  connectedCallback() { super.setup(); }

  /****************************************************************************
   * S'exécute lorsque les enfants sont prêts (RS_WCL.js --> HTMLBaseElement) *
   ****************************************************************************/
  childrenAvailableCallback() {

    // Lecture des attributs
    let height = this.getAttribute("rs-height");
    let tempo = this.getAttribute("rs-timer");

    // Récupération des contenus et génération de la liste
    let contents_list = [];
    let dom_contents = this.getElementsByTagName("rs-carousel-contents")[0].getElementsByTagName("rs-content");
    for (let content of dom_contents) {
      let div = document.createElement("DIV");
      div.classList.add("rs-content");
      div.innerHTML = content.innerHTML;
      div.style.flexDirection = content.getAttribute("direction") || DEFAULT_DIRECTION;
      contents_list.push(div);
    }

    // Génération du shadow DOM
    let shadow = this.attachShadow({ mode: SHADOW_MODE });
    RS_WCL.styleShadow(shadow, COMPONENTS_CSS_PATH + '/rs_carousel.css');
    shadow.appendChild(new RS_Carousel(height, tempo, contents_list));
  }
}
customElements.define('rs-carousel', RSWCLCarousel);
