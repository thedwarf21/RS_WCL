//---------------------------------------------------------------------------------------------------
//                                Champs TEXTAREA personnalisé
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class RS_Textarea extends HTMLTextAreaElement {

  /**************************************************************************************************
   * Génère un champ de formulaire de type TEXTAREA                                                 *
   **************************************************************************************************
   * @param | {string}  | id          | ID du TEXTAREA                                              *
   * @param | {string}  | value       | Valeur d'initialisation                                     *
   * @param | {string}  | rs_model    | Binding                                                     *
   * @param | {string}  | placeholder | Texte d'invite                                              *
   * @param | {boolean} | noresize    | Pour savoir si le composant doit pouvoir être redimensionné *
   * @param | {boolean} | readonly    | Pour savoir si le composant doit être en lecture seule      *
   * @param | {Array}   | classList   | Liste des feuilles de style CSS à appliquer                 *
   **************************************************************************************************
   * @return              {DOMElement}              Le TEXTAREA                                     *
   **************************************************************************************************/
  constructor(id, value, rs_model, placeholder, noresize, readonly, classList) {
    super();
    if (noresize)     this.classList.add("rs-noresize");
    if (placeholder)  this.setAttribute("placeholder", placeholder);
    for (let classe of classList)
      this.classList.add(classe);
    this.value = value;
    this.id = id;

    // Application du paramètre rs-readonly
    if (readonly) {
      this.setAttribute("readonly", "true");
      this.classList.add("readonly");
    }

    // Si un binding est paramétré
    if (rs_model) {

      // Application de la valeur pointée
      let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
      this.value = target_obj[property];

      // Mise en place du binding
      RS_Binding.bindModel(rs_model, this, "textContent", "change", (value)=> {
        let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
        target_obj[property] = this.value;
      });
    }
  }
}
customElements.define('rs-wcl-textarea', RS_Textarea, { extends: 'textarea' });

/* Usage HTML uniquement */
class RSWCLTextarea extends HTMLElement {

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
    let value = this.getAttribute("value");
    let rs_model = this.getAttribute("rs-model");
    let placeholder = this.getAttribute("placeholder");
    let noresize = this.getAttribute("noresize");
    let readonly = eval(this.getAttribute("rs-readonly")) || false;
    let classes = this.getAttribute("class");
    let classList = classes ? classes.split(" ") : [];
    RS_WCL.styleShadow(shadow, 'css/rs_textarea.css');
    RS_WCL.styleShadow(shadow, 'css/theme.css');
    shadow.appendChild(new RS_Textarea(id, value, rs_model, placeholder, noresize, readonly, classList));
  }
}
customElements.define('rs-textarea', RSWCLTextarea);
