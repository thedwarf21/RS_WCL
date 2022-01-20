//---------------------------------------------------------------------------------------------------
//                                Champs SWITCH (checkbox jolie)
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class RS_Switch extends HTMLDivElement {

  /***************************************************************
   * Génère et retourne un élément de formulaire de type switch  *
   ***************************************************************
   * @param  | {number}  | id        | ID du champ de formulaire *
   * @param  | {Boolean} | isChecked | Valeur d'initialisation   *
   * @param  | {Boolean} | isRounded | Thème carré / arrondi     *
   * @param  | {string}  | caption   | Libellé du champ          *
   * @param  | {string}  | rs_model  | Binding                   *
   ***************************************************************
   * @return             {DOMElement}        Le Composant        *
   ***************************************************************/
  constructor(id, isChecked, isRounded, caption, rs_model) {
    
    // On crée l'enveloppe et le switch (lui-même dans une enveloppe contenant le champ réel et la partie graphique)
    super();
    this.classList.add("rs-switch-container");
    let inputSwitch = document.createElement("LABEL");
    inputSwitch.classList.add("rs-switch");
    let input = document.createElement("INPUT");
    input.setAttribute("type", "checkbox");
    input.id = id;
    input.checked = isChecked;
    let span = document.createElement("SPAN");
    span.classList.add("rs-slider");
    if (isRounded) 
      span.classList.add("rs-round");
    inputSwitch.appendChild(input);
    inputSwitch.appendChild(span);

    // On crée le libellé
    let label = document.createElement("LABEL");
    label.classList.add("rs-caption");
    label.innerHTML = caption;

    // On remplit le container
    this.appendChild(inputSwitch);
    this.appendChild(label);

    // Si un "rs_model" est spécifié, on met en place le binding
    if (rs_model)
      RS_Binding.bindModel(rs_model, input, "checked", "change");
  }
}
customElements.define('rs-wcl-switch', RS_Switch, { extends: 'div' });

/* Usage HTML uniquement */
class RSWCLSwitch extends HTMLElement {

  /*******************************************************************
   * Constructeur: appeler simplement le constructeur de HTMLElement *
   *******************************************************************/
  constructor() { super(); }

  /*************************************************
   * S'exécute lors de l'ajout du composant au DOM *
   *************************************************/
  connectedCallback() {
    let shadow = this.attachShadow({ mode: SHADOW_MODE });
    let id = this.getAttribute("id");
    let isChecked = JSON.parse(this.getAttribute("checked")) || false;
    let isRounded = JSON.parse(this.getAttribute("rounded")) || false;
    let caption = this.getAttribute("caption");
    let rs_model = this.getAttribute("rs-model");
    RS_WCL.styleShadow(shadow, COMPONENTS_CSS_PATH + '/rs_switch.css');
    shadow.appendChild(new RS_Switch(id, isChecked, isRounded, caption, rs_model));
  }
}
customElements.define('rs-switch', RSWCLSwitch);
