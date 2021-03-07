/**
 * Celui-ci, je l'avais entamé, mais entre temps, j'ai eu d'autre choses à gérer...
 */

//---------------------------------------------------------------------------------------------------
//                                Composant Planning
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class RS_Planning extends HTMLDivElement {

  /**************************************************************************************************
   * Génère une boîte de dialogue permettant de choisir une date et une heure de plannifcation      *
   **************************************************************************************************
   * @param | {string}  | rs_model    | Binding                                                     *
   **************************************************************************************************
   * @return              {DOMElement}              La boîte de dialogue                            *
   **************************************************************************************************/
  constructor(rs_model) {
    super();

    // Extraction des données du modèles objet
    this.rs_model = rs_model;
    let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
    let objModel = target_obj[property];
    this.data = objModel.data;
    this.empty_record = objModel.empty_record;
    
    // Génération de l'affichage initial puis binding de la liste "data" => display()
    this.display();
    RS_ArrayObserver(this.data, ()=> { this.display(); }, false);
  }

  /*******************************************************
   * Fonction générant l'affichage du composant planning *
   *******************************************************/
  display() {

  }
}
customElements.define('rs-wcl-planning', RS_Planning, { extends: 'div' });

/* Usage HTML uniquement */
class RSWCLPlanning extends HTMLElement {

  /*******************************************************************
   * Constructeur: appeler simplement le constructeur de HTMLElement *
   *******************************************************************/
  constructor() { super(); }

  /*************************************************
   * S'exécute lors de l'ajout du composant au DOM *
   *************************************************/
  connectedCallback() {
    let shadow = this.attachShadow({ mode: SHADOW_MODE });
    let rs_model = this.getAttribute("rs-model");
    RS_WCL.styleShadow(shadow, 'css/rs_planning.css');
    RS_WCL.styleShadow(shadow, 'css/theme.css');
    shadow.appendChild(new RS_Planning(rs_model));
  }
}
customElements.define('rs-planning', RSWCLPlanning);
