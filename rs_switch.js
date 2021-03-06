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
    let label = document.createElement("DIV");
    label.classList.add("rs-caption");
    label.innerHTML = caption;

    // On remplit le container
    this.appendChild(inputSwitch);
    this.appendChild(label);
    
    // Pour permettre la récupération de la valeur si le composant est injecté en shadow DOM
    setTimeout(()=> {

      // Si un "rs_model" est spécifié, on met en place le binding
      if (rs_model) {
        RS_Binding.bindModel(rs_model, input, "value", "change", (value)=> {
          if (this.parentNode.host)
            this.parentNode.host.value = input.checked;
          let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
          target_obj[property] = input.checked;
        });
      }
    }, 25);
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
    RS_WCL.styleShadow(shadow, 'css/rs_switch.css');
    RS_WCL.styleShadow(shadow, 'css/theme.css');
    shadow.appendChild(new RS_Switch(id, isChecked, isRounded, caption, rs_model));
  }
}
customElements.define('rs-switch', RSWCLSwitch);
