/**
 * Ce commposant est prévu pour être injecté dans un panneau lattéral:
 * 
 * <div class="menu-gauche">
 *   <rs-side-menu rs-model="..."></rs-side-menu>
 * </div>
 */

/***********************
 * Quelques constantes *
 ***********************/
const MENU_INK_DEBORD = 0.2;    // Débord de l'indicateur par rapport au texte (ici 4/2 = 2px de chaque côté)
const CSS_SIZING_UNIT = "vw";   // Unité utilisée pour le dimensionnement dans le CSS

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
   *   - children--> éléments enfants
   *
   * "onCreaClick" sera évaluée comme code JS lors du clic sur "Nouveau" (absent si paramètre absent ou vide)
   */
  
  /**************************************************************************************************
   * Génère le COM (Component Object Model) du menu lattéral                                        *
   **************************************************************************************************
   * @param | {string} | rs_model     | Chemin dans "scope" vers la liste des éléments              *
   * @param | {string} | main_title   | Titre principal à afficher en haut du menu                  *
   **************************************************************************************************/
  constructor(rs_model, main_title) {
    super();

    // Récupération de la liste des éléments + initialisation des propriétés
    let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
      let elements = target_obj[property];
    this.elements = elements;        // Utilisée dans display()
    this.main_title = main_title;    // Utilisée dans display()
    this.classList.add("rs-menu");
    
    // On rappellera la fonction d'affichage, pour chaque manipulation de la liste ou de l'un de ses éléments
    RS_BindValuesRecursively(target_obj, property, ()=> { this.display() });

    // Pareil en cas de redimensionnement de la fenêtre
    window.addEventListener('resize', ()=> { this.placeInkBar(); })

    // Affichage initial + récupération de l'objet et de l'élément HTML correspondant à la sélection
    this.display();
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
    this.ink.style.opacity = "0";
    this.appendChild(this.ink);
    let titre = document.createElement("DIV");
    titre.classList.add("rs-menu-title");
    titre.innerHTML = this.main_title;
    this.appendChild(titre);

    // Construction de la liste, élément par élément
    for (let menu_item of this.elements)
      this.appendChild(this.getMenuItem(menu_item));

    // Affichage de l'indicateur de sélection (si pas d'item actif, pas d'indicateur visuel)
    this.placeInkBar();
  }

  /*********************************************************
   * Génère un élément du menu                             *
   *********************************************************
   * @param | {Object} | menu_item | Objet de description  *
   *********************************************************
   * @return  {HTMLDivElement}       L'élément HTML généré *
   *********************************************************/
  getMenuItem(menu_item) {
    let item = document.createElement("DIV");
    item.classList.add("rs-menu-item");

    // Construction de l'élément
    let itemDisplay = document.createElement("DIV");
    itemDisplay.classList.add("rs-menu-item-display");
    item.appendChild(itemDisplay);
    let caption = document.createElement("DIV");
    caption.classList.add("caption");
    caption.innerHTML = menu_item.lib;

    // Si l'élément a des enfants, il s'agit d'un noeud
    if (menu_item.children) {
      let node_img = document.createElement("DIV");
      node_img.classList.add("node-image");
      caption.style.paddingLeft = "0";
      itemDisplay.appendChild(node_img);
    }
    itemDisplay.appendChild(caption);

    // S'il s'agit d'un noeud, on ajoute ses éléments enfants dans un conteneur
    if (menu_item.children) {
      let childrenContainer = document.createElement("DIV");
      childrenContainer.classList.add("children-container");
      item.appendChild(childrenContainer);
      for (let childItem of menu_item.children)
        childrenContainer.appendChild(this.getMenuItem(childItem));
    }

    // Si l'élément est doté d'une propriété onclick, on met en place l'événement
    if (menu_item.onclick) {
      itemDisplay.addEventListener("click", (event)=> {
          this.selected_menu_item = item;
          this.placeInkBar();
          menu_item.onclick();
      });
    }
    return item;
  }

  /*******************************************************************************
   * Appelée lors de la sélection d'un élément. Place la inkbar sous cet élément *
   *******************************************************************************
   * @param | {HTMLDivElement} | menu_item | Élément de menu cliqué              *
   *******************************************************************************/
  placeInkBar() {
    if (this.selected_menu_item) {
      this.ink.style.opacity = "1";
      this.ink.style.top = `${this.selected_menu_item.getBoundingClientRect().bottom + window.scrollY}px`;
      this.ink.style.left = `calc(${this.selected_menu_item.firstChild.getBoundingClientRect().left}px - ${MENU_INK_DEBORD/2}${CSS_SIZING_UNIT})`;
      this.ink.style.width = `calc(${this.selected_menu_item.firstChild.firstChild.scrollWidth}px + ${MENU_INK_DEBORD}${CSS_SIZING_UNIT})`;
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
    
    // Ajout des feuilles de style
    RS_WCL.styleShadow(shadow, COMPONENTS_CSS_PATH + '/rs_menu.css');
    shadow.appendChild(new RS_SideMenu(rs_model, main_title));
  }
}
customElements.define('rs-side-menu', RSWCLSideMenu);
