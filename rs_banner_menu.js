//---------------------------------------------------------------------------------------------------
//                                   Affichage d'un menu lattéral
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class RS_BannerMenu extends HTMLDivElement {

  /**
   * L'objet pointé par "rs_model" est un arbre dont les nœuds sont définis comme suit :
   *   - lib =>         Le libellé de l'entrée de menu à présenter à l'utilisateur
   *   - seconde propriété au choix :
   *     - children =>  La liste des nœuds enfants
   *     - onclick =>   La fonction à exécuter lors d'un clic sur l'élément de menu
   *
   * En outre les nœuds définissant une propriété children pourront également définir la propriété :
   *   - onCreaClick => La fonction à éxécuter lors d'un clic sur l'élément enfant "Nouveau"
   *   
   * En effet, le composant ajoutera automatique l'élément "Nouveau" aux enfants des nœuds concernés.
   */
  
  /**************************************************************************************************
   * Génère le COM (Component Object Model) du menu lattéral                                        *
   **************************************************************************************************
   * @param | {string} | rs_model     | Chemin dans "scope" vers la liste des éléments              *
   **************************************************************************************************/
  constructor(rs_model) {
    super();

    // Récupération de la liste des éléments + initialisation des propriétés
    let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
      let elements = target_obj[property];
    this.elements = elements;
    this.classList.add("rs-banner-menu");
    
    // On rappellera la fonction d'affichage, pour chaque manipulation de la liste ou de l'un de ses éléments
    RS_BindValuesRecursively(target_obj, property, ()=> { this.display() });
  }

  /*******************************************************************************
   * Purge le composant, avant de le garnir de son contenu                       *
   *******************************************************************************
   * @param | {HTMLElement} | curHtmlNode | Nœud HTML d'insertion du menu        *
   * @param | {Object}      | curBranch   | Branche à parcourir                  *
   *******************************************************************************
   * @return   {array}    L'objet et l'élément HTML correspondant à la sélection *
   *******************************************************************************/
  display(curHtmlNode, curBranch) {
    let elementsList;

    // Lors de l'appel initial (sans paramètre)
    if (!curBranch) {
      this.innerHTML = "";           // purge du contenu
      curHtmlNode = this;            // nœud html courant => this
      elementsList = this.elements;  // branche courante => tronc de l'arbre
    } else elementsList = curBranch.children;

    // Construction de la liste, élément par élément
    for (let [idx, menu_item] of elementsList.entries()) {
      let new_item = this.getMenuItem(menu_item, idx);
      curHtmlNode.appendChild(new_item);
    }

    // Si on a une fonction de création, on ajoute "Nouveau"
    if (curBranch && curBranch.onCreaClick) {
      let creation_item = this.getMenuItem(null, elementsList.length, curBranch.onCreaClick);
      curHtmlNode.appendChild(creation_item);
    }
  }

  /***********************************************************
   * Génère un élément du menu                               *
   ***********************************************************
   * @param | {Object}   | menu_item | Objet de description  *
   * @param | {number}   | idx       | Indice de l'élément   *
   * @param | {Function} | onCreate  | Pour "Nouveau"        *
   ***********************************************************
   * @return  {HTMLDivElement}         L'élément HTML généré *
   ***********************************************************/
  getMenuItem(menu_item, idx, onCreate) {

    // Création de l'élément et du conteneur
    let item = document.createElement("DIV");
    item.classList.add("rs-menu-item");
    let cont = document.createElement("DIV");
    item.appendChild(cont);

    // Génération par défaut du libellé
    cont.innerHTML = `<i>${menu_item.lib}</i>`;

    // Si pas d'objet de description => item de création
    // Si l'élément a des enfants => flèche + création du sous-menu
    // Sinon, c'est une feuille => mise en place du onclick
    if (!menu_item) {
      cont.innerHTML = "<b>Nouveau</b>";
      item.addEventListener("click", (event)=> { onCreate(); });
    } else if (menu_item.children) {
      
      // Ajout de la flèche
      cont.innerHTML += " ";
      let image = document.createElement("IMG");
      image.classList.add("arrow");
      image.src = "img/chevron_2.png";
      cont.appendChild(image);

      // Construction du sous-menu
      let submenu_div = document.createElement("DIV");
      submenu_div.classList.add("rs-submenu");
      cont.appendChild(submenu_div);

      // Appel récursif à la fonction d'affichage, pour le nœud html et la branche adéquate
      this.display(submenu_div, menu_item);
    } else item.addEventListener("click", (event)=> { menu_item.onclick(); });

    // Retour
    return item;
  }
}
customElements.define('rs-wcl-banner-menu', RS_BannerMenu, { extends: 'div' });

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
class RSWCLBannerMenu extends HTMLElement {

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
    
    // Ajout des feuilles de style
    RS_WCL.styleShadow(shadow, 'css/rs_menu.css');
    RS_WCL.styleShadow(shadow, 'css/theme.css');
    shadow.appendChild(new RS_BannerMenu(rs_model));
  }
}
customElements.define('rs-banner-menu', RSWCLBannerMenu);
