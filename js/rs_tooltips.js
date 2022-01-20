/**
 * Le composant RS-TOOLTIP est prévu pour englober l'élément auquel il se réfère.
 *
 * Lorsque le RS-TOOLTIP est survolé, une DIV de classe "rs-tooltip-window" est générée, et détruite sur le "mouseleave"
 *
 * ADDENDUM: ça fonctionnait ça ?! Faire hériter de HTMLBaseElement plutôt que de HTMLElement serait sans doute plus safe.
 */

/* Usage HTML uniquement */
class RSWCLTooltip extends HTMLBaseElement {

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
    let shadow = this.attachShadow({ mode: SHADOW_MODE });
    this.tooltip = this.getElementsByTagName("tooltip")[0].innerHTML;
    this.position = this.getAttribute("position");
    this.visible = false;

    // Création de la DIV rs-tooltip
    this.wrapper = document.createElement("DIV");
    this.wrapper.classList.add("rs-tooltip-wrapper");

    // Injection du style et du DOM dans le shadow
    RS_WCL.styleShadow(shadow, COMPONENTS_CSS_PATH + '/rs_tooltips.css');
    this.wrapper.innerHTML = this.getElementsByTagName("content")[0].innerHTML;
    shadow.appendChild(this.wrapper);

    // Ajout des listeners => création / suppression du DIV affichant le tooltip
    this.wrapper.addEventListener('mousemove', (event)=> { this.mouseOver(event); });
    this.wrapper.addEventListener('mouseleave', ()=> { this.mouseLeave(); });
  }

  /********************************************************************************
   * Appelée lors du survol:                                                      *
   *   Crée la DIV flottante "rs-tooltip" et la flèche en fonction de la position *
   ********************************************************************************/
  mouseOver(event) {
    
    // On tente de récupérer les éléments du composant
    let popup, arrow;
    let lstPopup = this.wrapper.getElementsByClassName("rs-tooltip-window");
    if (lstPopup.length == 0) {  // Si le composant graphique n'est pas présent, il faut le créer

      // La popup
      popup = document.createElement("DIV");
      popup.classList.add("rs-tooltip-window");
      popup.innerHTML = this.tooltip;
      this.wrapper.appendChild(popup);

      // La flèche
      arrow = document.createElement("DIV");
      arrow.classList.add("rs-arrow");
      arrow.classList.add(this.position);
      this.wrapper.appendChild(arrow);
    } else {
      popup = lstPopup[0];
      arrow = this.wrapper.getElementsByClassName("rs-arrow")[0];
    }

    // Positionnement absolu des élément en fonction de la position souris et des paramètres
    this.computePosition(event.clientX, event.clientY, popup, arrow);
    this.visible = true;
  }

  /**************************************************
   * Appelée lorsque l'on quitte la zone de survol: *
   *   Détruit la DIV flottante "rs-tooltip"        *
   **************************************************/
  mouseLeave() {
    if (this.visible) {
      this.wrapper.removeChild(this.wrapper.getElementsByClassName("rs-tooltip-window")[0]);
      this.wrapper.removeChild(this.wrapper.getElementsByClassName("rs-arrow")[0]);
      this.visible = false;
    }
  }

  /************************************************************************************************************
   * Positionne la popup en fonction de la position de la souris et de la position paramétrée pour le tooltip *
   ************************************************************************************************************
   * @param | {number}      | clientX | Position abscisses de la souris en pixels                             *
   * @param | {number}      | clientY | Position ordonnées de la souris en pixels                             *
   * @param | {HTMLElement} | popup   | Élément HTML                                                          *
   * @param | {HTMLElement} | arrow   | Élément HTML                                                          *
   ************************************************************************************************************/
  computePosition(clientX, clientY, popup, arrow) {
    
    // Positionnement horizontal
    if (this.position.indexOf('e') != -1) {                      // Contient 'e' => popup à l'est > ouest
      popup.style.left = (clientX + 10) + "px";
      arrow.style.left = (clientX + 5) + "px";
    } else if (this.position.indexOf('w') != -1) {               // Contient 'w' => popup à l'ouest > est
      popup.style.left = (clientX - popup.offsetWidth - 10) + "px";
      arrow.style.left = (clientX - 25) + "px";
    } else {                                                     // Aucun => popup centrée horizontalement
      popup.style.left = (clientX - 0.5 * popup.offsetWidth) + "px";
      arrow.style.left = (clientX - 0.5 * arrow.offsetWidth) + "px";
    }

    // Positionnement vertical
    if (this.position.indexOf('n') != -1) {                      // Contient 'n' => popup au nord > sud
      popup.style.top = (clientY - popup.offsetHeight - 10) + "px";
      arrow.style.top = (clientY - arrow.offsetHeight - 5) + "px";
    } else if (this.position.indexOf('s') != -1) {               // Contient 's' => popup au sud > nord
      popup.style.top = (clientY + 10) + "px";
      arrow.style.top = (clientY + 5) + "px";
    } else {                                                     // Aucun => popup centrée verticalement
      popup.style.top = (clientY - 0.5 * popup.offsetHeight) + "px";
      arrow.style.top = (clientY - 0.5 * arrow.offsetHeight) + "px";
    }
  }
}
customElements.define('rs-tooltips', RSWCLTooltip);
