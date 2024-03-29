//---------------------------------------------------------------------------------------------------
//                                Buton personnalisé 
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class RS_Button extends HTMLInputElement {

  /***********************************************************
   * Génère un bouton d'action                               *
   ***********************************************************
   * @param | {string}   | caption   | Libellé du bouton     *
   * @param | {function} | onClick   | Événement onClick     *
   * @param | {Array}    | classList | Liste des classes CSS *
   ***********************************************************/
  constructor(caption, onClick, classList) {
    super();
    this.setAttribute("type", "button");
    this.value = caption;
    this.classList.add("rs-btn-action");
    for(let classe of classList)
      this.classList.add(classe);
    this.addEventListener("click", ()=> { onClick(); });
  }
}
customElements.define('rs-button', RS_Button, { extends: 'input' });

//---------------------------------------------------------------------------------------------------
//                 Champ INPUT personnalisé avec libellés flottants
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class RS_Input extends HTMLDivElement {

  /***********************************************************************
   * Génération de champs de formulaire de type TEXT                     *
   ***********************************************************************
   * @param  | {string}  | id        | Identifiant unique dans le DOM    *
   * @param  | {string}  | value     | Valeur du champ à sa création     *
   * @param  | {string}  | labelTxt  | Texte du label                    *
   * @param  | {string}  | rs_model  | Binding                           *
   * @param  | {boolean} | readonly  | Si true, lecture seule            *
   * @param  | {Array}   | classList | Liste des classes CSS à appliquer *
   ***********************************************************************/
  constructor(id, value, labelTxt, rs_model, readonly, classList) {

    // On va créer un container pour le label et le champ
    super();
    this.classList.add("rs-input-cont");

    // Si le rs_model est renseigné, on initialise la valeur avec celle pointée par rs_model
    if (rs_model) {
      let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
      value = target_obj[property];
    }

    // Création et ajout du label (div mouvante avec animation)
    let label = document.createElement("DIV");
    label.innerHTML = labelTxt;
    label.classList.add("rs-label");
    label.classList.add(`rs-label-${ value ? 'out' : 'in' }side`);
    this.appendChild(label);

    // Création et ajout au container de l'input en lui-même
    let elt = document.createElement("INPUT");
    elt.id = id;
    elt.value = value ? value : "";
    elt.setAttribute("type", "text");
    elt.classList.add("rs-input-field");
    if (readonly) {
      elt.setAttribute("readonly", "true");
      elt.classList.add("readonly");
    }
    for (let classe of classList)
      elt.classList.add(classe);
    this.appendChild(elt);
    this.input = elt;
    
    // Si un "rs_model" est spécifié, on met en place le binding
    if (rs_model)
      RS_Binding.bindModel(rs_model, elt, "value", "change", null, ()=> { this.inputBlured(); });
      
    // Ajout des événements
    elt.addEventListener("focus", ()=> { this.popLabel(); });
    elt.addEventListener("blur", ()=> { this.inputBlured(); });
    label.addEventListener("click", ()=> { elt.focus(); });
  }

  /************************************
   * Sort le label du champ de saisie *
   ************************************/
  popLabel() {
    let lbl = this.getElementsByClassName("rs-label")[0];
    if (lbl.classList.contains("rs-label-inside"))
      lbl.classList.remove("rs-label-inside");
    if (!lbl.classList.contains("rs-label-outside"))
      lbl.classList.add("rs-label-outside");
  }

  /*************************************************
   * Fait rentrer le label dans le champ de saisie *
   *************************************************/
  pushLabel() {
    let lbl = this.getElementsByClassName("rs-label")[0];
    if (!lbl.classList.contains("rs-label-inside"))
      lbl.classList.add("rs-label-inside");
    if (lbl.classList.contains("rs-label-outside"))
      lbl.classList.remove("rs-label-outside");
  }

  /******************************************************
   * Ramène le label dans le champ si celui-ci est vide *
   ******************************************************/
  inputBlured() {
    let inp = this.getElementsByClassName("rs-input-field")[0];
    if (!inp.value)
      this.pushLabel();
    else this.popLabel();
  }

  /** Permet d'appliquer un type particulier à l'INPUT */
  setFieldType(type) { this.input.setAttribute("type", type); }
}
customElements.define('rs-wcl-input', RS_Input, { extends: 'div' });

/* Usage HTML uniquement */
class RSWCLInput extends HTMLElement {

  /*******************************************************************
   * Constructeur: appeler simplement le constructeur de HTMLElement *
   *******************************************************************/
  constructor() { super(); }

  /*************************************************
   * S'exécute lors de l'ajout du composant au DOM *
   *************************************************/
  connectedCallback() {
    let shadow = this.attachShadow({ mode: SHADOW_MODE });
    this.id = this.getAttribute("id");
    let value = this.getAttribute("value");
    let label = this.getAttribute("label");
    let rs_model = this.getAttribute("rs-model");
    let readonly = eval(this.getAttribute("rs-readonly")) || false;
    let classes = this.getAttribute("class");
    let classList = classes ? classes.split(" ") : [];
    RS_WCL.styleShadow(shadow, COMPONENTS_CSS_PATH + '/rs_input.css');
    shadow.appendChild(new RS_Input(this.id, value, label, rs_model, readonly, classList));
  }
}
customElements.define('rs-input', RSWCLInput);
