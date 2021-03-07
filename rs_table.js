/**
 * Ceci est l'outil ultime pour construire un back office en quatrième vitesse :
 * Génère un tableau CRUD éditable à partir d'un objet. 
 * Je peux fournir une classe d'exemple à utiliser avec, sur demande (intègre les appels AjaX aux API backend)
 */

//---------------------------------------------------------------------------------------------------
//                                   Affichage d'un tableau CRUD
//---------------------------------------------------------------------------------------------------
/* Usage JS uniquement */
class RS_Table extends HTMLDivElement {

  /**
   * L'objet ciblé par "rs_model" doit contenir 2 propriétés (une 3ème est optionnelle) :
   * 
   * 1/ La liste d'objets "headers", permet un paramétrage de l'affichage du tableau.
   *    Chaque objet de la liste correspond à une colonne et contient les propriétés suivantes :
   *      - key      --> nom de la propriété correspondante dans les tuples (propriété "data" du "rs_model")
   *      - lib      --> libellé de la colonne, à afficher en entête
   *      - width    --> largeur à appliquer littérallement au style de la colonne (ex: "calc(100% - 12px)")
   *      - visible  --> booléen permettant de cacher certaines rubriques du tuple (id, par exemple)
   *      - readonly --> booléen permettant de déterminer quels champs sont en lecture seule (ex: champs calculés)
   *      
   *    Propriétés optionnelles :
   *      - select   --> objet de configuration du champ <rs-select>
   *          * get_liste ----> Chemin d'accès à la liste des éléments (string)
   *          * key_field ----> Nom de la propriété portant la valeur, dans les éléments
   *          * lib_field ----> Nom de la propriété portant le texte, dans les éléments
   *      - type     --> type de composant de saisie (si pas <input> classique ni <rs-select>)
   *          * bool      ----> Affichera une checkbox
   *
   * 2/ "data" contient la liste des tuples sous forme d'objets. Les propriétés de ces objets sont listées
   *    dans "headers" (propriété "key").
   *    Chaque élément de "data" peut également contenir les propriété "onchange" et "ondelete"
   *    
   *    Dans le cas où au moins un élément de "headers" contient la propriété "select", l'objet "select_elts"
   *    doit également figurer dans les propriétés de "data" => propriétés du même nom que dans "data", pour
   *    chaque select : celle-ci est initialisée par <rs-table> avec l'élément HTML généré pour le champ
   *
   * 3/ "empty_record" est l'enregistrement vide à partir duquel sera généré le formulaire de création
   *    Cet enregistrement doit contenir la propriété "oncreate" en plus des propriétés porteuses de données
   */
  
  /*****************************************************************
   * Génère une liste au format tableau                            *
   *****************************************************************
   * @param | {string} | rs_model    | Lien vers le modèle objet   *
   *****************************************************************
   * Chaque enregistrement de "data" est un objet comportant       *
   * au moins les propriétés dont les noms correspondent aux       *
   * headers, ainsi qu'un objet onchange ayant ces mêmes           *
   * caractéristiques au niveau des propriétés                     *
   *****************************************************************/
  constructor(rs_model) {
    super();
    this.classList.add("rs-table");

    // Extraction des données du modèles objet
    this.rs_model = rs_model;
    let [target_obj, property] = RS_Binding.getObjectAndPropertyNameFromModel(rs_model);
    let objModel = target_obj[property];
    this.headers = objModel.headers;
    this.data = objModel.data;
    this.empty_record = objModel.empty_record;
    
    // Génération de l'affichage initial puis binding de la liste "data" => display()
    this.display();
    RS_ArrayObserver(this.data, ()=> { this.display(); }, false);
  }

  /*********************************************
   * Fonction d'affichage de la liste éditable *
   *********************************************/
  display() {

    // Purge de la table et ajout des entêtes de colonnes
    this.innerHTML = "";
    this.getTableHeader();

    // Si l'objet pointé par "rs_model" contient "empty_record" et si le "oncreate" est câblé => ligne de création
    if (this.empty_record && this.empty_record.oncreate)
      this.getTableLine(null, this.empty_record);

    // Ajout des lignes correspondant aux enregistrements de la table
    for (let [idx, objLigne] of this.data.entries())
      this.getTableLine(idx, objLigne);
  }

  /******************************************************************
   * Génère la ligne correspondant aux entêtes d'une liste en table *
   ******************************************************************
   * @return             {DOMElement}         La ligne d'entête     *
   ******************************************************************/
  getTableHeader() {

    // On utilise un conteneur de rs-table-line pour la ligne d'entête
    let line = document.createElement("DIV");
    line.classList.add("rs-table-line");

    // Ajout des "cellules" à la ligne d'entête
    for (let [idx, header] of this.headers.entries()) {
      if (header.visible || !header.key) {  // Si colonne visible ou colonne boutons d'action
        let cell = document.createElement("DIV");
        cell.classList.add("rs-headers-cell");
        cell.style.width = idx ? `calc(${header.width} - 1px` : header.width;
        cell.innerHTML = header.lib || "";
        line.appendChild(cell);
      }
    }

    // On retourne le résultat
    this.appendChild(line);
  }

  /*****************************************************************
   * Génère une ligne éditable pour une liste de type ligne        *
   *****************************************************************
   * @param | {number} | idx         | Indice dans la liste        *
   * @param | {Object} | data        | Données de la ligne         *
   *****************************************************************
   * Les noms de propriétés doivent correspondre aux key des       *
   * headers                                                       *
   * Si 'oncrete' ou 'ondelete' n'est pas renseigné, le bouton     *
   * correspondant, ne sera pas généré                             *
   *****************************************************************
   * @return      {DOMElement}      La liste au format tableau     *
   *****************************************************************/
  getTableLine(idx, data) {
    
    // On utilise un conteneur de rs-table-line pour la ligne de données
    let line = document.createElement("DIV");
    line.classList.add("rs-table-line");
    
    // Ajout des "cellules éditables" à la ligne 
    // (en modif, appliquer l'événement onChange)
    // (colonne sans entête = boutons d'action => pas cellule éditable)
    for (let header of this.headers) {
      if (header.key) {              // Propriété key absente => c'est la colonne des boutons d'action
        if (header.visible) {        // Gestion du paramètre de visibilité de la colonne
          let cell;
          let cell_model = idx == null
                         ? `${this.rs_model}.empty_record.${header.key}`
                         : `${this.rs_model}.data[${idx}].${header.key}`;
          if (header.readonly && idx != null) // La propriété readonly est ignorée pour la ligne de création
            cell = this.getReadOnlyCell(cell_model, data, header);
          else if (header.select)
            cell = this.getSelectCell(cell_model, data, header);
          else if (header.type == "bool")
            cell = this.getCheckboxCell(cell_model, data, header);
          else
            cell = this.getEditableCell(cell_model, data, header);

          // Ajout de la cellule à la ligne
          line.appendChild(cell);
        }
      } else line.appendChild(this.getActionButton(idx, data, header));
    }

    // On retourne le résultat
    this.appendChild(line);
  }

  /**********************************************************************************************
   * Génère et retourne une cellule de type readonly bindée                                     *
   **********************************************************************************************
   * @param | {string} | cell_model | Chemin vers la valeur correspondante dans le modèle objet *
   * @param | {object} | data       | Données de la ligne                                       *
   * @param | {object} | header     | Entête de la colonne dans laquelle se situe la cellule    *
   **********************************************************************************************
   * @return  {HTMLDivElement}        La cellule bindée et alimentée                            *
   **********************************************************************************************/
  getReadOnlyCell(cell_model, data, header) {
    let cell = document.createElement("DIV");
    cell.classList.add("rs-readonly-cell");
    cell.style.width = `calc(${header.width} - 4px)`;
    cell.innerHTML = data[header.key];
    RS_Binding.bindModel(cell_model, cell, "innerHTML");
    return cell;
  }

  /**********************************************************************************************
   * Génère et stocke dans "data" et retourne une cellule de type <rs-select>                   *
   **********************************************************************************************
   * @param | {string} | cell_model | Chemin vers la valeur correspondante dans le modèle objet *
   * @param | {object} | data       | Données de la ligne                                       *
   * @param | {object} | header     | Entête de la colonne dans laquelle se situe la cellule    *
   **********************************************************************************************
   * @return  {RS_Select}             La cellule de type <rs-select>                            *
   **********************************************************************************************/
  getSelectCell(cell_model, data, header) {
    let cell = new RS_Select( header.select.get_liste, 
                              header.select.key_field, 
                              header.select.lib_field, 
                              cell_model, header.width,
                              data.onchange );
    data.select_elts[header.key] = cell;
    return cell;
  }

  /**********************************************************************************************
   * Génère une cellule contenant une checkbox bindée                                           *
   **********************************************************************************************
   * @param | {string} | cell_model | Chemin vers la valeur correspondante dans le modèle objet *
   * @param | {object} | data       | Données de la ligne                                       *
   * @param | {object} | header     | Entête de la colonne dans laquelle se situe la cellule    *
   **********************************************************************************************
   * @return  {HTMLInputElement}      La checkbox                                               *
   **********************************************************************************************/
  getCheckboxCell(cell_model, data, header) {
    let cell = document.createElement("INPUT");
    cell.classList.add("rs-editable-cell");
    cell.setAttribute("type", "checkbox");
    cell.style.width = `calc(${header.width} - 4px)`;
    if (data[header.key])
      cell.setAttribute("checked", "true");

    // Mise en place du live binding
    if (data.onchange)
      RS_Binding.bindModel(cell_model, cell, "checked", "change", (val)=> { data.onchange(header.key, val); });
    RS_Binding.bindModel(cell_model, cell, "checked", "change");
    return cell;
  }

  /**********************************************************************************************
   * Génère une cellule éditble (<INPUT>) bindée                                                *
   **********************************************************************************************
   * @param | {string} | cell_model | Chemin vers la valeur correspondante dans le modèle objet *
   * @param | {object} | data       | Données de la ligne                                       *
   * @param | {object} | header     | Entête de la colonne dans laquelle se situe la cellule    *
   **********************************************************************************************
   * @return  {HTMLInputElement}      La cellule éditable bindée et alimentée                   *
   **********************************************************************************************/
  getEditableCell(cell_model, data, header) {
    let cell = document.createElement("INPUT");
    cell.classList.add("rs-editable-cell");
    cell.setAttribute("type", "text");
    cell.style.width = `calc(${header.width} - 4px)`;
    cell.value = data[header.key];

    // Mise en place du live binding
    if (data.onchange)
      RS_Binding.bindModel(cell_model, cell, "value", "change", (val)=> { data.onchange(header.key, val); });
    RS_Binding.bindModel(cell_model, cell, "value", "change");
    return cell;
  }

  /**************************************************************************************
   * Génère et retourne le bouton d'action idoine ou une cellule vide selon le contexte *
   **************************************************************************************
   * @param | {number} | idx    | Indice de la ligne dans "this.data"                   *
   * @param | {object} | data   | Données de la ligne                                   *
   * @param | {object} | header | Entête de la colonne                                  *
   **************************************************************************************
   * @return  {RS_Button | HTMLDivElement}        La cellule / bouton généré(e)         *
   **************************************************************************************/
  getActionButton(idx, data, header) {

    // Selon le cas, on crée un bouton de création, un bouton de suppression ou une cellule vide
    let elt;
    if (data.oncreate)
      elt = new RS_Button("Créer", ()=> { data.oncreate(this.data, this.empty_record); }, ["rs-btn-create"]);
    else if (data.ondelete)
      elt = new RS_Button("Suppr.", ()=> { data.ondelete(this.data, idx); }, ["rs-btn-suppr"]);
    else
      elt = document.createElement("DIV");
    
    // Dimensionnement et retour
    elt.style.width = `calc(${header.width} - 3px)`;
    return elt;
  }
}
customElements.define('rs-wcl-table', RS_Table, { extends: 'div' });

//---------------------------------------------------------------------------------------------------
/* Usage HTML uniquement */
class RSWCLTable extends HTMLElement {

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
    let rs_model = this.getAttribute("rs-model");
    
    // Ajout des feuilles de style
    RS_WCL.styleShadow(shadow, 'css/rs_liste.css');
    RS_WCL.styleShadow(shadow, 'css/theme.css');
    shadow.appendChild(new RS_Table(rs_model));
  }
}
customElements.define('rs-table', RSWCLTable);
