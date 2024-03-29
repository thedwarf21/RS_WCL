//---------------------------------------------------------------------------------------------------
//                       Affichage d'une liste déroulante avec champ filtre
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class RS_Select extends HTMLInputElement {
  
  /***********************************************************************************************
   * Génération d'un select avec zone de saisie de filtre intégrée                               *
   ***********************************************************************************************
   * @param | {string}   | get_liste | Code JS à évaluer pour récupérer la liste d'objets        *
   * @param | {string}   | key_field | Le nom de la propriété servant de clé (valeur réelle)     *
   * @param | {string}   | lib_field | Le nom de la propriété servant à l'affichage et au filtre *
   * @param | {string}   | rs_model  | Chemin pour le binding modèle                             *
   * @param | {string}   | css_width | Largeur au format CSS (optionnel)                         *
   * @param | {Function} | onchange  | Fonction appelée lors de la modification (optionnel)      *
   ***********************************************************************************************/
  constructor(get_liste, key_field, lib_field, rs_model, css_width, onchange) {
    super();
    this.setAttribute("type", "text");
    this.classList.add("rs-input-field");
    if (css_width)
      this.style.width = `calc(${css_width} - 4px)`;

    // Récupération des informations de binding
    let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
    this.model_obj = target_obj;
    this.model_prop = property;

    // Initialisation des données permettant de manipuler les objets de la liste
    this.key_field = key_field;
    this.lib_field = lib_field;
    this.changeFct = onchange;

    // Chargement de la liste d'objets, et initialisation de la liste d'affichage
    get_liste = get_liste.replace(/^scope\./g, 'document.currentController.scope.')
                         .replace(/\sscope\./g, ' document.currentController.scope.');
    this.objList = eval(get_liste);      // Liste de l'ensemble des valeurs
    this.displayList = this.objList;     // Liste des valeurs à afficher (après application du filtre)

    // Application du filtre et réaffichage de la liste des items correspondants (s'il y en a)
    // S'il n'y a qu'un seul élément dans la liste, on applique la valeur correspondante au modèle
    this.addEventListener("keyup", ()=> {
      if (!this.getAttribute("readonly")) {  // Ignorer les frappe clavier quand le champ est verrouillé
        this.hideItems();
        this.displayList = this.getFilteredList();
        if (this.displayList.length == 1) {
          this.setAttribute("readonly", true);  // Verouillage du champ en cas de sélection automatique
          this.value = this.displayList[0][this.lib_field];
          this.setModelValue(this.displayList[0][this.key_field]);
          this.select();
        }
        this.displayItems();
      }
    });

    // Afficher la liste en entrant sur le champ, la cacher en sortant
    // En outre, on sélectionne également tout le texte saisi, en entrant sur le champ
    this.addEventListener("focus", ()=> { 
      this.select();
      if (this.displayList.length == 1) { // Si un seul résultat, on affiche tout et on supprime le readonly
        this.displayList = this.objList;
        this.removeAttribute("readonly");
      }
      this.displayItems(); 
    });
    this.addEventListener("blur", ()=> {
      setTimeout(()=> {    // Léger délai permettant au click sur item de s'exécuter
        this.hideItems(); 
      }, 200);
    });

    // Initialisation de la valeur par défaut et ajout du binding objet -> élément
    this.initValue();
  }

  /***************************************************************
   * Initialise la sélection par défaut, si la valeur est connue *
   ***************************************************************/
  initValue() {
    let model_value = this.model_obj[this.model_prop];
    if (model_value) {
      let selected = this.objList.filter(obj => obj[this.key_field] == model_value);
      if (selected.length) // Si la valeur référencée initialement n'existe plus, pas de sélection
        this.value = selected[0][this.lib_field];
    }
  }

  /****************************************************************
   * Fonction de modification de la valeur pointée par "rs_model" *
   ****************************************************************
   * @param | {string|boolean|number} | value | valeur            *
   ****************************************************************/
  setModelValue(value) {
    this.model_obj[this.model_prop] = value;
    if (typeof this.changeFct === "function") {
      this.changeFct(this.key_field, value);
    }
  }

  /******************************************************************************
   * Permet de récupérer la liste filtrée en fonction de la saisie              *
   ******************************************************************************
   * @return {array}     Liste filtrée avec "this.value" sur la valeur affichée *
   ******************************************************************************/
  getFilteredList() { 
    return this.objList.filter(obj => obj[this.lib_field].toLowerCase().indexOf(this.value.toLowerCase()) != -1); 
  }

  /*************************************************************
   * Génère un <div> flottant, affichant la liste filtrée      *
   *                                                           *
   * Les éléments de la liste reçoivent un listener 'click'    *
   * mettant à jour les informations de sélection et le filtre *
   *************************************************************/
  displayItems() {
    let float_div;

    // Si elle n'existe pas déjà, on crée la DIV flottante sinon, on va la chercher
    if (!this.float_div_wrapper) {
      float_div = document.createElement("DIV");
      float_div.classList.add("rs-select-float");

      // Ajout du <div> flottant au document
      this.float_div_wrapper = RS_WCL.addShadowElementWithStyle(float_div, "rs_input.css");
    } else float_div = this.float_div_wrapper.querySelector(".rs-select-float");

    // On calcule ensuite les coordonnées du <div>
    let box = this.getBoundingClientRect(),
        top = box.top + this.offsetHeight;
    float_div.style.top = top + "px";
    float_div.style.left = box.left + "px";

    // Génération de la liste au sein du <div>
    for (let item of this.displayList) {
      let div = document.createElement("DIV");
      div.classList.add("rs-select-item");

      // Mise en gras de la / des partie(s) du texte correspondant au filtre
      let expr_reg = new RegExp(this.value.toLowerCase(), "g");
      div.innerHTML = item[this.lib_field].toLowerCase().replace(expr_reg, "<b>" + this.value + "</b>");

      // Ajout de l'élément au <div> flottant
      float_div.appendChild(div);

      // Click => mise à jour du filtre et du modèle
      div.addEventListener("click", ()=> {
        this.value = item[this.lib_field];
        this.setModelValue(item[this.key_field]); // Binding élément -> objet
        this.displayList = this.getFilteredList();
      });
    }

    // Si aucun élément trouvé, on affiche un message
    if (this.displayList.length == 0) {
      let div = document.createElement("DIV");
      div.classList.add("rs-select-item");
      div.innerHTML = "<i>Aucun résultat trouvé pour </i><b>" + this.value + "</b>";
      float_div.appendChild(div);
    }

    // Si la <div> flottante déborde de la page, on la positionne au dessus de l'<input>
    if (top + float_div.offsetHeight > document.body.clientHeight) {
      top = box.top - float_div.offsetHeight;
      float_div.style.top = top + "px";
    }
  }

  /****************************
   * Retire le <div> flottant *
   ****************************/
  hideItems() {
    document.body.removeChild(this.float_div_wrapper);
    delete this.float_div_wrapper;
  }
}
customElements.define('rs-wcl-select', RS_Select, { extends: 'input' });

//---------------------------------------------------------------------------------------------------
/* Usage HTML uniquement */
class RSWCLSelect extends HTMLElement {

  /*******************************************************************
   * Constructeur: appeler simplement le constructeur de HTMLElement *
   *******************************************************************/
  constructor() { super(); }

  /*************************************************
   * S'exécute lors de l'ajout du composant au DOM *
   *************************************************/
  connectedCallback() {
    let shadow = this.attachShadow({ mode: SHADOW_MODE });

    // Récupération des attributs du composant
    let get_liste = this.getAttribute("init");
    let key_field = this.getAttribute("key");
    let lib_field = this.getAttribute("lib");
    let rs_model = this.getAttribute("rs-model");
    let width = this.getAttribute("css-width");
    let onchange = (key_field, value)=> { 
      eval(this.getAttribute("onchange")); 
    };

    // Ajout des feuilles de style
    RS_WCL.styleShadow(shadow, COMPONENTS_CSS_PATH + '/rs_input.css');
    shadow.appendChild(new RS_Select(get_liste, key_field, lib_field, rs_model, width, onchange));
  }
}
customElements.define('rs-select', RSWCLSelect);
