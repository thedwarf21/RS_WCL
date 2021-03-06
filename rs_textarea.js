/*
  Copyright © 10/02/2020, Roquefort Softwares Web Components Library

  Permission is hereby granted, free of charge, to any person obtaining a copy of this Library and associated 
  documentation files (the “Software”), to deal in the Software without restriction, including without limitation 
  the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
  and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  The Software is provided “as is”, without warranty of any kind, express or implied, including but not limited to 
  the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the 
  authors or copyright holders Roquefort Softwares be liable for any claim, damages or other liability, whether in 
  an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or 
  other dealings in the Software.
  
  Except as contained in this notice, the name of the Roquefort Softwares Web Components Library shall not be used 
  in advertising or otherwise to promote the sale, use or other dealings in this Software without prior written 
  authorization from Roquefort Softwares.
*/

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
