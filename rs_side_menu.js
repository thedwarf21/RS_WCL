/***********************
 * Quelques constantes *
 ***********************/
const MENU_ITEM_HEIGHT = 40;  // Hauteur des DIV item : à synchroniser avec le CSS
const MENU_INK_DEBORD = 4;    // Débord de l'indicateur par rapport au texte (ici 4/2 = 2px de chaque côté)

//---------------------------------------------------------------------------------------------------
//                                   Affichage d'un menu lattéral
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class RS_SideMenu extends HTMLDivElement {

  /**
   * La liste d'objets "elements", passée en paramètre, contient les entrées du menu.
   * Chaque objet de la liste contient les propriétés suivantes :
   *   - lib     --> libellé de l'élément de menu
   *   - onclick --> événement à rattacher au clic sur l'élément
   *
   * "onCreaClick" sera évaluée comme code JS lors du clic sur "Nouveau" (absent si paramètre absent ou vide)
   */
  
  /**************************************************************************************************
   * Génère le COM (Component Object Model) du menu lattéral                                        *
   **************************************************************************************************
   * @param | {string} | rs_model     | Chemin dans "scope" vers la liste des éléments              *
   * @param | {string} | main_title   | Titre principal à afficher en haut du menu                  *
   * @param | {string} | ink_color    | Couleur de l'indicateur de sélection                        *
   * @param | {string} | onCreaClick  | Code JS à exécuter si l'on clique sur "Nouveau" (optionnel) *
   * @param | {number} | selected_idx | Indice de la sélection par défaut (optionnel)               *
   **************************************************************************************************/
  constructor(rs_model, main_title, ink_color, onCreaClick, selected_idx) {
    super();

    // Récupération de la liste des éléments + initialisation des propriétés
    let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
      let elements = target_obj[property];
    this.elements = elements;        // Utilisée dans display()
    this.oncreate = onCreaClick;     // Utilisée dans constructor() et getItem()
    this.main_title = main_title;    // Utilisée dans display()
    this.ink_color = ink_color;      // Utilisée dans display()
    this.classList.add("rs-menu");

    // Si aucun indice n'est choisi, on placera l'indicateur de sélection comme suit :
    //    - Liste ouverte en création => sélection de l'élément "Nouveau"
    //    - Menu figé => sélection du premier élément
    let has_default_selection = selected_idx != null && selected_idx != undefined;
    if (!has_default_selection)
      this.selected_idx = undefined;
    else this.selected_idx = selected_idx;
    
    // On rappellera la fonction d'affichage, pour chaque manipulation de la liste ou de l'un de ses éléments
    RS_BindValuesRecursively(target_obj, property, ()=> { this.display() });

    // On attend que la page soit construite, sinon, l'indicateur de sélection ne se taillera pas correctement
    setTimeout(()=> {

      // Affichage initial + récupération de l'objet et de l'élément HTML correspondant à la sélection
      let [selected_obj, selected_item] = this.display();

      // Si événement de création et qu'il n'y a pas de sélection par défaut 
      // => sélection auto de "Nouveau" => exécution du code correspondant
      if (onCreaClick && !has_default_selection)
        eval(onCreaClick);

      // Placement de la barre désignant l'élément sélectionné, et exécution du "onclick" si sélection par défaut
      if (has_default_selection)
        selected_obj.onclick();
    }, 100);
  }

  /*******************************************************************************
   * Purge le composant, avant de le garnir de son contenu                       *
   *******************************************************************************
   * @return   {array}    L'objet et l'élément HTML correspondant à la sélection *
   *******************************************************************************/
  display() {

    // Purge, puis injection de l'indicateur de sélection et du titre
    this.innerHTML = "";
    this.ink = document.createElement("DIV");
    this.ink.classList.add("rs-menu-ink");
    if (this.ink_color)  // Si une couleur spécifique est paramétrée, on l'applique
      this.ink.style.backgroundColor = this.ink_color;
    if (this.selected_idx == undefined) // Si aucun élément n'est encore sélectionné, pas de barre
      this.ink.style.opacity = "0";
    else this.ink.style.opacity = "1";
    this.appendChild(this.ink);
    let titre = document.createElement("DIV");
    titre.classList.add("rs-menu-title");
    titre.innerHTML = this.main_title;
    this.appendChild(titre);

    // Construction de la liste, élément par élément
    // On en profite pour identifier l'élément sélectionné par défaut, s'il y a lieu
    let selected_item,
        selected_obj;
    for (let [idx, menu_item] of this.elements.entries()) {
      let new_item = this.getMenuItem(menu_item, idx);
      this.appendChild(new_item);
      if (idx == this.selected_idx) {
        selected_obj = menu_item;
        selected_item = new_item;
      }
    }

    // Si on a une fonction de création, on ajoute "Nouveau"
    if (this.oncreate) {
      this.creation_item = this.getMenuItem({}, this.elements.length);
      this.appendChild(this.creation_item);
    } 

    // Liste ouverte en création, sans sélection par défaut => on se place sur "Nouveau"
    if (selected_item)
      this.placeInkBar(selected_item);
    else if (this.selected_idx != undefined)
      this.placeInkBar(this.creation_item);

    // On retourne l'objet et l'élément correspondant à la sélection
    return [selected_obj, selected_item];
  }

  /*********************************************************
   * Génère un élément du menu                             *
   *********************************************************
   * @param | {Object} | menu_item | Objet de description  *
   * @param | {number} | idx       | Indice de l'élément   *
   *********************************************************
   * @return  {HTMLDivElement}       L'élément HTML généré *
   *********************************************************/
  getMenuItem(menu_item, idx) {
    let item = document.createElement("DIV");
    item.innerHTML = menu_item.lib ? `<i>${menu_item.lib}</i>` : "<b>Nouveau</b>";
    item.classList.add("rs-menu-item");
    item.setAttribute("inkpos", this.childNodes.length * MENU_ITEM_HEIGHT + "px");

    // Si on a un libellé (pas "Nouveau"), on repositionne la inkbar avant d'exécuter le onclick de l'élément
    if (menu_item.lib) {
      item.addEventListener("click", (event)=> {
        this.selected_idx = idx;
        this.placeInkBar(item);
        menu_item.onclick();
      });
    } else {    // Sinon, on repositionne la inkbar avant d'éxécuter le oncreate du composant
      item.addEventListener("click", (event)=> {
        this.selected_idx = idx;
        this.placeInkBar(item);
        eval(this.oncreate);
      });
    }
    return item;
  }

  /*******************************************************************************
   * Appelée lors de la sélection d'un élément. Place la inkbar sous cet élément *
   *******************************************************************************
   * @param | {HTMLDivElement} | menu_item | Élément de menu cliqué              *
   *******************************************************************************/
  placeInkBar(menu_item) {
    if (menu_item) {
      this.ink.style.opacity = "1";
      this.ink.style.top = menu_item.getAttribute("inkpos");
      this.ink.style.width = menu_item.firstChild.scrollWidth + MENU_INK_DEBORD + "px";
    } else this.ink.style.opacity = "0";
  }
}
customElements.define('rs-wcl-side-menu', RS_SideMenu, { extends: 'div' });

/* Usage HTML uniquement */
/**
 * La balise <rs-side-menu></rs-side-menu> attend les attributs suivants :
 *     - rs-model    => chemin dans "document.currentController.scope", de la liste des éléments
 *     - menu-title  => titre du menu (accepte le HTML)
 *     - ink-color   => CSS: couleur de l'indicateur de sélection (optionnel)
 *     - oncreate    => string évaluée comme JS lors d'un clic sur l'élément "Nouveau"
 *                      l'élément n'apparaîtra pas si l'attr "oncreate" est vide ou absent
 *     - selected-index => indice de l'élément sélectionné par défaut (optionnel)
 */
class RSWCLSideMenu extends HTMLElement {

  /*******************************************************************
   * Constructeur: appeler simplement le constructeur de HTMLElement *
   *******************************************************************/
  constructor() { super(); }

  /*************************************************
   * S'exécute lors de l'ajout du composant au DOM *
   *************************************************/
  connectedCallback() {
    let shadow = this.attachShadow({ mode: SHADOW_MODE });
    
    // Récupération des attributs
    let rs_model = this.getAttribute("rs-model");
    let main_title = this.getAttribute("menu-title");
    let ink_color = this.getAttribute("ink-color");
    let onCreaClick = this.getAttribute("oncreate");
    let selected_idx = this.getAttribute("selected-index");
    
    // Ajout des feuilles de style
    RS_WCL.styleShadow(shadow, 'css/rs_menu.css');
    RS_WCL.styleShadow(shadow, 'css/theme.css');
    shadow.appendChild(new RS_SideMenu(rs_model, main_title, ink_color, onCreaClick, selected_idx));
  }

  /***********************************************************
   * Sélectionne un élément du menu via son indice           *
   ***********************************************************
   * @param  {number} idx Indice de l'élément à sélectionner * 
   ***********************************************************/
  selectItem(idx) {
    let dom_idx = this.shadowRoot.children.length - 1;
    let component = this.shadowRoot.children[dom_idx];
    let menu_items = component.getElementsByClassName("rs-menu-item");

    // Si l'élément de menu existe réellement, on le sélectionne
    if (menu_items[idx]) {
      component.selected_idx = idx;
      menu_items[idx].click();
    } else (console.warn(`L'item de menu [${idx}] n'existe pas`));
  }

  /*******************************************************************************
   * Déplace le curseur du menu, sur l'item dont l'indice est passé en paramètre *
   *******************************************************************************
   * @param | {number} | idx | Indice ciblé                                      *
   *******************************************************************************/
  moveInkBar(idx) {
    let dom_idx = this.shadowRoot.children.length - 1;
    let component = this.shadowRoot.children[dom_idx];
    let menu_items = component.getElementsByClassName("rs-menu-item");

    // Si l'élément de menu existe réellement, on le sélectionne
    if (menu_items[idx]) {
      component.selected_idx = idx;
      component.placeInkBar(menu_items[idx]);
    }
    else (console.warn(`L'item de menu [${idx}] n'existe pas`));
  }

  /***********************************************************************
   * Retire l'élément courant du menu, et sélectionne le dernier restant *
   ***********************************************************************/
  removeCurrentItem() {
    let dom_idx = this.shadowRoot.children.length - 1;
    let component = this.shadowRoot.children[dom_idx];
    let menu_items = component.getElementsByClassName("rs-menu-item");

    // Retrait de l'élément courant puis positionnement sur le dernier
    component.elements.splice(component.selected_idx, 1);
    let new_idx = component.elements.length - 1;
    component.selected_idx = undefined;
    component.display();
  }

  /**********************************************
   * Force la re-sélection de l'élément courant *
   **********************************************/
  refreshTarget() {
    let dom_idx = this.shadowRoot.children.length - 1;
    let component = this.shadowRoot.children[dom_idx];
    let menu_items = component.getElementsByClassName("rs-menu-item");
    menu_items[component.selected_idx].click();
  }
}
customElements.define('rs-side-menu', RSWCLSideMenu);
