//---------------------------------------------------------------------------------------------------
//                 Structure de contrôle pour injection conditionnée
//---------------------------------------------------------------------------------------------------
/* Usage HTML uniquement */
class RSWCLIf extends HTMLBaseElement {

  /*******************************************************************
   * Constructeur: appeler simplement le constructeur de HTMLElement *
   *******************************************************************/
  constructor() { super(); }

  /*************************************************
   * S'exécute lors de l'ajout du composant au DOM *
   *************************************************/
  connectedCallback() { super.setup(); }

  /****************************************************************************
   * S'exécute lorsque les enfants sont prêts (RS_WCL.js --> HTMLBaseElement) *
   ****************************************************************************/
  childrenAvailableCallback() {

    // Récupération des attributs
    let shadow = this.attachShadow({ mode: SHADOW_MODE });
    this.expression = this.getAttribute("expression");
    this.html_content = this.innerHTML;

    // Injection des feuilles de style (si besoin)
    let css_files = this.getAttribute("css-files");
    css_files = css_files ? css_files.split(' ') : [];
    for (let filename of css_files)
      RS_WCL.styleShadow(shadow, filename);
    this.css_links = shadow.innerHTML;

    // Identifier la/les propriété(s) à observer pour permettre la mise à jour automatique du shadow DOM
    // Il peut y avoir des opérations dans les tests, donc il faut tester chaque membre de l'expression
    let expr_split = this.expression.split(' ');
    for (let expr_member of expr_split) {
      let is_operator = new RegExp(/^[\+\/\*-<>]$/).test(expr_member)             // opérateurs simples
                     || new RegExp(/^[=!><]==?$/).test(expr_member);              // opérateurs de comparaison
      let is_value = new RegExp(/^[0-9]+(?:\.[0-9])?$/).test(expr_member)         // valeurs numériques
                  || new RegExp(/^[\[\{'"`](?:.)*[\]\}'"`]$/).test(expr_member)   // strings, arrays, et objects
                  || new RegExp(/^true|false$/).test(expr_member)                 // booléens
                  || new RegExp(/\)$/).test(expr_member);                         // fonctions et constructeurs

      // Si le membre n'est ni un opérateur, ni une valeur / appel de fonction / constructeur, c'est une variable
      // Il faut donc vérifier si l'expression est vraie à chaque fois que sa valeur change => binding
      if (!is_operator && !is_value) {
        let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(expr_member);
        RS_BindValuesRecursively(target_obj, property, ()=> { this.refreshShadow(); });
      }
    }
    
    // Si L'expression est vraie on injecte le html
    this.refreshShadow();
  }

  /******************************************************************************************
   * Raffraîchit le shadow DOM en y injectant le content ou en le vidant selon l'expression *
   ******************************************************************************************/
  refreshShadow() {
    let expression = this.expression.replace(/^scope\./g, 'document.currentController.scope.')
                                    .replace(/\sscope\./g, ' document.currentController.scope.');
    if (eval(expression))
      this.shadowRoot.innerHTML = this.css_links + this.html_content;
    else this.shadowRoot.innerHTML = "";
  }
}
customElements.define('rs-if', RSWCLIf);

//---------------------------------------------------------------------------------------------------
//                 Structure de contrôle pour boucles intégrées au HTML
//---------------------------------------------------------------------------------------------------
// Attribut obligatoire:
//   - for         => définit la structure de contrôle (type de boucle, comportement, etc...)
//   
// Attributs optionnels:
//   - when-ready  => Fonction appelée lorsque le composant est prêt
//   - css         => Feuille de style à faire utiliser au composant
//   - class       => Liste des classes CSS à appliquer au wrapper, séparées par des " "
//---------------------------------------------------------------------------------------------------
/* Usage HTML uniquement */
class RSWCLRepeat extends HTMLElement {

  /*******************************************************************
   * Constructeur: appeler simplement le constructeur de HTMLElement *
   *******************************************************************/
  constructor() { super(); }

  /*************************************************
   * S'exécute lors de l'ajout du composant au DOM *
   *************************************************/
  connectedCallback() {

    // Récupération des attributs
    this.html_template = this.innerHTML.trim();
    let shadow = this.attachShadow({ mode: SHADOW_MODE });
    let control = this.getAttribute("for");
    this.readyCallbackScript = this.getAttribute("when-ready");
    let css_file = this.getAttribute("css");
    let classes = this.getAttribute("class");
    classes = classes ? classes.split(" ") : [];

    // Si un fichier CSS a été paramétré, on l'utilise pour les styles au sein du shadow DOM
    if (css_file)
      RS_WCL.styleShadow(shadow, css_file);

    // Création d'un wrapper (évite d'écraser la feuille de style à l'appel de "this.display")
    this.wrapper = document.createElement("DIV");
    this.wrapper.id = "wrapper";
    shadow.appendChild(this.wrapper);
    for (let css_class of classes)
      this.wrapper.classList.add(css_class);

    // Découpage de la chaîne "control" pour analyse
    let control_parts = control.split(" ");
    let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(control_parts[2]);
    
    // Paramètres du parcours
    this.control = {
      element: control_parts[0],
      operator: control_parts[1],
      iterable: target_obj[property],
      target_obj: target_obj,
      target_prop: property,
      target_litteral: control_parts[2].substring(0, control_parts[2].lastIndexOf("."))
    };

    // Affichage et mise en place du binding pour les valeurs affichées
    this.display();
    this.bindInterpolatedValues();

    // Si "when-ready" a été défini, on exécute le code correspondant
    if (this.readyCallbackScript)
      eval(this.readyCallbackScript);
  }

  /****************************************************************************
   * Génère le HTML du shadow DOM, par interpolation, en fonction du template *
   ****************************************************************************/
  display() {
    if (this.control.operator == "of")
      this.loopForOf();
    else if (this.control.operator == "in")
      this.loopForIn();
    else console.error(`RSWCLRepeat(): Bad control operator '${this.control.operator}'. Use 'of' or 'in', instead`);
  }

  /*******************************************************************
   * Méthode appliquant un binding de la / des valeur(s) observée(s) *
   * et déclenchant le raffraîchissement en live de l'affichage      *
   *******************************************************************/
  bindInterpolatedValues() {
    RS_BindValuesRecursively(this.control.target_obj, this.control.target_prop, ()=> { this.display(); });
  }

  /***************************************************************************************
   * Fonction générant un DOM en fonction d'une boucle FOR .. OF (itération sur liste)   *
   ***************************************************************************************/
  loopForOf() {
    let html_string = "";
    this.current_index = 0;
    if (this.control.iterable) { // Évite l'erreur générée par boucles imbriquées, avant qu'elles soient traitées 
      for (let elem of this.control.iterable) {
        html_string += this.interpolate(this.prepareChildrenRepeats(), elem);
        this.current_index++;
      }

      // Injection du code HTML "traduit" dans le wrapper du composant
      this.wrapper.innerHTML = html_string;
    }
  }

  /***************************************************************************************
   * Fonction générant un DOM en fonction d'une boucle FOR .. IN (itération sur objet)   *
   ***************************************************************************************/
  loopForIn() {
    let html_string = "";
    if (this.control.iterable) { // Évite l'erreur générée par boucles imbriquées, avant qu'elles soient traitées 
      for (let elem in this.control.iterable) {
        this.current_index = `"${elem}"`;
        html_string += this.interpolate(this.prepareChildrenRepeats(), elem);
      }

      // Injection du code HTML "traduit" dans le wrapper du composant
      this.wrapper.innerHTML = html_string;
    }
  }

  /** A étudier plus tard pour optimisation des imbrications, en remplacement de prepareChildrenRepeats() 
    (il y aura des subtilités à prendre en compte pour que ça fonctionne) **/
  translateControlElementName() {
    let str_iterable = `${this.control.target_litteral}.${this.control.target_prop}[${this.current_index}]`;
    return this.html_template.replace(new RegExp(this.control.element, 'g'), str_iterable);
  }

  /*************************************************************************************************
   * Fonction nécessaire à la gestion des boucles imbriquées                                       *
   *************************************************************************************************
   * @return {string} template HTML du composant courant, avec paramètre "for" des boucles enfants *
   *                  adaptées à l'élément courant de la boucle                                    *
   *************************************************************************************************/
  prepareChildrenRepeats() {

    // Parcours des boucles <rs-repeat> dans le template HTML
    let output_html = this.html_template;
    let idx = this.html_template.indexOf("rs-repeat");
    while (idx != -1) {

      // Extraction du paramètre "for" et de sa valeur
      let for_set = this.html_template.substring(idx);
      if (this.html_template.substring(idx-1, idx) != "/") {  // Ignorer les balises fermantes
        for_set = for_set.substring(for_set.indexOf('for="') + 5);
        for_set = for_set.substring(0, for_set.indexOf('"'));

        // Découpage du paramètre "for" et remplacement de "iterable" par l'objet modèle correspondant si besoin
        let control_parts = for_set.split(" ");
        let str_iterable = `${this.control.target_litteral}.${this.control.target_prop}[${this.current_index}]`;
        control_parts[2] = control_parts[2].replace(new RegExp(this.control.element, 'g'), str_iterable);
        let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(control_parts[2]);
        let new_for = control_parts.join(" ");
        output_html = output_html.replace(for_set, new_for);
      }
      
      // Mise à jour de l'index pour l'itération suivante
      idx = this.html_template.indexOf("rs-repeat", idx + 1);
    }

    // On répète l'opération pour les attributs "rs-model"
    idx = this.html_template.indexOf("rs-model");
    while (idx != -1) {

      // Extraction du paramètre "rs_model" et de sa valeur
      let rs_model = this.html_template.substring(idx);
      rs_model = rs_model.substring(rs_model.indexOf('"') + 1);
      rs_model = rs_model.substring(0, rs_model.indexOf('"'));
      let rs_model_old = rs_model;

      // Remplacement de "iterable" par l'objet modèle correspondant si besoin
      let str_iterable = `${this.control.target_litteral}.${this.control.target_prop}[${this.current_index}]`;
      rs_model = rs_model.replace(new RegExp(this.control.element, 'g'), str_iterable);
      output_html = output_html.replace(rs_model_old, rs_model);
      
      // Mise à jour de l'index pour l'itération suivante
      idx = this.html_template.indexOf("rs-model", idx + 1);
    }

    // À la fin du parcours, on retourne la chaîne de caractères mise à jour
    return output_html;
  }

  /*****************************************************************************
   * Fonction d'interpolation des valeurs au sein du template, pour un élément *
   *****************************************************************************
   * @param | {string} | html_string | Code HTML d'origine                     *
   * @param | {any}    | elem        | Valeur(s) à interpoler / nom propriété  *
   *****************************************************************************
   * @return  {string}                Code HTML final                          *
   *****************************************************************************/
  interpolate(html_string, elem) {

    // Si on a affaire à une liste, on remplace "{{element.*}}" par la valeur de "elem.*"
    // Si on a affaire à un objet, on gère les noms de propriétés (interpolation directe) et les valeurs "{{element[*]}}"
    // Sinon on remplace "{{element}}" par "elem" (cas d'interpolation directe)
    let parent_obj = this.control.iterable;
    let element = this.control.element;
    if (typeof(elem) == 'object') {
      let retour = html_string;
      for (let property in elem)
        retour = retour.replace(new RegExp(`\\{\\{${element}\\.${property}\\}\\}`, 'g'), elem[property]);
      let str_iterable = `${this.control.target_litteral}.${this.control.target_prop}[${this.current_index}]`;
      if (str_iterable.startsWith("scope."))
        str_iterable = "document.currentController." + str_iterable;
      retour = retour.replace(new RegExp(`\\{\\{${element}\\}\\}`, 'g'), str_iterable);
      return retour;
    } else if (typeof(parent_obj) == 'object') {
      let retour = html_string;
      let iterable = this.control.iterable.replace(/\./g, '\\.').replace(/\_/g, '\\_');
      return html_string.replace(new RegExp(`\\{\\{${element}\\}\\}`, 'g'), elem)
                        .replace(new RegExp(`\\{\\{${iterable}\\[${element}\\]\\}\\}`, 'g'), parent_obj[elem]);
    } else {
      let regexp = new RegExp(`\\{\\{${element}\\}\\}`, 'g');
      return html_string.replace(regexp, elem);
    }
  }
}
customElements.define('rs-repeat', RSWCLRepeat);