"use strict";

//Global variables
const AllcalculatedSubnets  = {CSV_structure: "Nr,Useable IP Address range,Network Address,Broadcast,Subnetmask,CIDR Notation,IP Class,Binary Subnetmask,Total number of hosts,Usable number of hosts"}
let Subnetcounter = 0;

//Listener for button interactions
const Btn_Analyze = document.getElementById("Btn_Analyze");
Btn_Analyze.addEventListener("click", Button_Analyze);
const Btn_NextSubnet = document.getElementById("Btn_NextSubnet");
Btn_NextSubnet.addEventListener("click", NextSubnet);
const Bnt_Download_CSV = document.getElementById("Btn_SaveToCSV");
Bnt_Download_CSV.addEventListener("click", Download_CSV);

function Button_Analyze(){
    let IPAddress = Get_HTML_IPAddress();
    let Subnetmask = Get_HTML_Subnetmask_CIDR();
    Analyze(IPAddress, Subnetmask);
}

function Get_HTML_IPAddress(){
    let IP_Address = document.getElementById("Input_IP_Address").value;
    return IP_Address;
}

function Get_HTML_Subnetmask_CIDR(){
    let Subnetmask = document.getElementById("Input_Subnetmask").value;
    return Subnetmask;
}

//Detects if the IP Address is valid
function ValidIP (IP_Address_octets) {
    if (((IP_Address_octets.length == 4 && IP_Address_octets[0] > 0 && IP_Address_octets[0] < 256) && IP_Address_octets[1] > -1 && IP_Address_octets[1] < 256 && IP_Address_octets[2] > -1 && IP_Address_octets[2] < 256 && IP_Address_octets[3] > -1 && IP_Address_octets[3] < 256) && (!IP_Address_octets[0].startsWith("0") || IP_Address_octets[0].length == 1) && (!IP_Address_octets[1].startsWith("0") || IP_Address_octets[1].length == 1) && (!IP_Address_octets[2].startsWith("0") || IP_Address_octets[2].length == 1) && (!IP_Address_octets[3].startsWith("0") || IP_Address_octets[3].length == 1)) {   
        return true;
    }
}

//Detects if the Subnetmask is valid, CIDR notation (1-32) is also considered valid.
function ValidSubnetmask(Subnetmask){
    let notfull_octet = "(255|254|252|248|240|224|192|128|0)";
    let full_octet = "255.";
    let emptyoctet = "0";
    let ValidSubnetmask_Regex = new RegExp(((notfull_octet + "." + emptyoctet + "." + emptyoctet + "." + emptyoctet) + "|" + (full_octet + notfull_octet + "." + emptyoctet + "." + emptyoctet) + "|" + (full_octet + full_octet + notfull_octet + "." + emptyoctet) + "|" + (full_octet + full_octet + full_octet + notfull_octet) + "|" + "[1-32]"));
    if (ValidSubnetmask_Regex.exec(Subnetmask) !== null){
        return true;
    }    
}

//Calculates the CIDR notation, the input has to be the Subnetmask in form of an array where the (DOT) is used to split the Subnetmask
function CIDR_Notation(Subnetmask_octets){  
    let VAR_CIDR_Notation = "";
    if (Subnetmask_octets.length == 1){ 
        VAR_CIDR_Notation = Subnetmask_octets[0];
        return VAR_CIDR_Notation;
    }
    else{
        let CIDR_Part1 = parseInt(Subnetmask_octets[0], 10).toString(2).split("0");
        let CIDR_Part2 = parseInt(Subnetmask_octets[1], 10).toString(2).split("0");
        let CIDR_Part3 = parseInt(Subnetmask_octets[2], 10).toString(2).split("0");
        let CIDR_Part4 = parseInt(Subnetmask_octets[3], 10).toString(2).split("0");
        VAR_CIDR_Notation = CIDR_Part1[0].length + CIDR_Part2[0].length + CIDR_Part3[0].length + CIDR_Part4[0].length; 
        VAR_CIDR_Notation = VAR_CIDR_Notation.toString();
        return VAR_CIDR_Notation;
    }
}

//Creates the Subnetworkmask from the CIDR notation
function Subnetmask_Notation (Subnetmask_octets){ 
    if (Subnetmask_octets.length == 4){
        let Subnetmask_rebuilt = Subnetmask_octets.join(".") 
        return Subnetmask_rebuilt;
    }
    if (Subnetmask_octets.length == 1) { 
        let full_octets = Subnetmask_octets[0] / 8; 
        full_octets = full_octets.toString(); 
        let full_octets_array = full_octets.split("."); 
        let remainder = Subnetmask_octets[0] % 8; 
        let Subnetmask_array = []; 
        if (full_octets_array[0] == 0){ 
            Subnetmask_array.push(256 - Math.pow(2, 8-remainder)); 
            Subnetmask_array.push("0");
            Subnetmask_array.push("0");
            Subnetmask_array.push("0");
        }
        if (full_octets_array[0] == 1) {
            Subnetmask_array.push("255");
            Subnetmask_array.push(256 - Math.pow(2, 8-remainder));
            Subnetmask_array.push("0");
            Subnetmask_array.push("0");
        }
       if (full_octets_array[0] == 2){
            Subnetmask_array.push("255");
            Subnetmask_array.push("255");
            Subnetmask_array.push(256 - Math.pow(2, 8-remainder));
            Subnetmask_array.push("0");
       }
       if (full_octets_array[0] == 3){
            Subnetmask_array.push("255");
            Subnetmask_array.push("255");
            Subnetmask_array.push("255");
            Subnetmask_array.push(256 - Math.pow(2, 8-remainder));
       }         
       if (full_octets_array[0] == 4){
            Subnetmask_array.push("255");
            Subnetmask_array.push("255");
            Subnetmask_array.push("255");
            Subnetmask_array.push("255");
       }                            
    let Subnetmask_rebuilt = Subnetmask_array.join(".");
    return Subnetmask_rebuilt;
    }
}

//Calculates the Binary Subnetmask
function Binary_Subnetmask (Subnetmask_octets){ 
        let Binary_Subnetmask_Part1 = parseInt(Subnetmask_octets[0], 10).toString(2);
        let Binary_Subnetmask_Part2 = parseInt(Subnetmask_octets[1], 10).toString(2);
        let Binary_Subnetmask_Part3 = parseInt(Subnetmask_octets[2], 10).toString(2);
        let Binary_Subnetmask_Part4 = parseInt(Subnetmask_octets[3], 10).toString(2);
        let Binary_Subnetmask_complete = Binary_Subnetmask_Part1 + "." + Binary_Subnetmask_Part2 + "." + Binary_Subnetmask_Part3 + "." + Binary_Subnetmask_Part4;
        if (Subnetmask_octets[1] == 0 && Subnetmask_octets[2] == 0 && Subnetmask_octets[3] == 0){
            Binary_Subnetmask_Part2 = "00000000"
            Binary_Subnetmask_Part3 = "00000000"
            Binary_Subnetmask_Part4 = "00000000"
            Binary_Subnetmask_complete = Binary_Subnetmask_Part1 + "." + Binary_Subnetmask_Part2 + "." + Binary_Subnetmask_Part3 + "." + Binary_Subnetmask_Part4;
        }
        if (Subnetmask_octets[1] != 0 && Subnetmask_octets[2] == 0 && Subnetmask_octets[3] == 0){
            Binary_Subnetmask_Part3 = "00000000"
            Binary_Subnetmask_Part4 = "00000000"
            Binary_Subnetmask_complete = Binary_Subnetmask_Part1 + "." + Binary_Subnetmask_Part2 + "." + Binary_Subnetmask_Part3 + "." + Binary_Subnetmask_Part4;
        }
        if (Subnetmask_octets[1] != 0 && Subnetmask_octets[2] != 0 && Subnetmask_octets[3] == 0){
            Binary_Subnetmask_Part4 = "00000000"
            Binary_Subnetmask_complete = Binary_Subnetmask_Part1 + "." + Binary_Subnetmask_Part2 + "." + Binary_Subnetmask_Part3 + "." + Binary_Subnetmask_Part4;
        }
        return Binary_Subnetmask_complete;                
}

//Determines IP Class
function IPClass(IP_Address_octets) {
    let Networkclass;
    if (IP_Address_octets[0] > 0 && IP_Address_octets[0] < 127) {
        Networkclass = "A (0.0.0.0 - 126.255.255.255)";
    }
    else if (IP_Address_octets[0] == 127) {
        Networkclass = "Loopback IP range";  
    } 
    else if (IP_Address_octets[0] > 127 && IP_Address_octets[0] < 192) {
        Networkclass = "B (128.0.0.0 - 191.255.255.255)";
    }
    else if (IP_Address_octets[0] > 191 && IP_Address_octets[0] < 224) {
        Networkclass = "C (192.0.0.0 - 223.255.255.255)";
    }
    else if (IP_Address_octets[0] > 223 && IP_Address_octets[0] < 240) { 
        Networkclass = "D (224.0.0.0 - 239.255.255.255)";
    }
    else if (IP_Address_octets[0] > 239 && IP_Address_octets[0] < 256) { 
        Networkclass = "E (240.0.0.0 - 255.255.255.255)";
    }
    return Networkclass;  
}

//calculates total number of hosts in the in the subnet, input is the CIDR notation
function TotalNumberofHosts (VAR_CIDR_Notation){
        let TotalNumberofHosts =  Math.pow(2, 32 - VAR_CIDR_Notation);
        return TotalNumberofHosts;  
}

//calculates usable number of hosts in the in the subnet, input is the CIDR notation
function UsableNumberofHosts (VAR_CIDR_Notation){
    let UsableNumberofHosts =  Math.pow(2, 32 - VAR_CIDR_Notation) -2;
    return UsableNumberofHosts;
}

//calculates the (usable) IP range / Network Address / Broadcast based on the CIDR notation and the IP Address
function IPrange(CIDR,IP_Address_octets){
    let Subnet_ID;
    let Broadcast;
    let Usuable_IP_Address_range;
    if(CIDR >= 24){
        let IP_octet =  Math.pow(2, 32 - CIDR);
        let Subnet_ID_last_octet = Math.trunc(IP_Address_octets[3]/IP_octet)*IP_octet;
        Subnet_ID = IP_Address_octets[0] + "." + IP_Address_octets[1] + "." + IP_Address_octets[2] + "." + Subnet_ID_last_octet;
        Broadcast = IP_Address_octets[0] + "." + IP_Address_octets[1] + "." + IP_Address_octets[2] + "." + (Subnet_ID_last_octet + IP_octet - 1);
        Usuable_IP_Address_range = IP_Address_octets[0] + "." + IP_Address_octets[1] + "." + IP_Address_octets[2] + "." + (Subnet_ID_last_octet + 1) + " - " +  IP_Address_octets[0] + "." + IP_Address_octets[1] + "." + IP_Address_octets[2] + "." + (Subnet_ID_last_octet + IP_octet - 2);
    }
    if(CIDR < 24 && CIDR >= 16){
        let IP_octet = Math.pow(2, 24 - CIDR);
        let Subnet_ID_third_octet = Math.trunc(IP_Address_octets[2]/IP_octet)*IP_octet;
        Subnet_ID = IP_Address_octets[0] + "." + IP_Address_octets[1] + "." + Subnet_ID_third_octet + "." + "0";
        Broadcast = IP_Address_octets[0] + "." + IP_Address_octets[1] + "." + (Subnet_ID_third_octet + IP_octet - 1) + "." + "255";
        Usuable_IP_Address_range = IP_Address_octets[0] + "." + IP_Address_octets[1] + "." + Subnet_ID_third_octet + "." + "1" + " - " +  IP_Address_octets[0] + "." + IP_Address_octets[1] + "." + (Subnet_ID_third_octet + IP_octet-1) + "." + "254";
    }
    if(CIDR < 16 && CIDR >= 8){
        let IP_octet = Math.pow(2, 16 - CIDR);
        let Subnet_ID_second_octet = Math.trunc(IP_Address_octets[1]/IP_octet)*IP_octet;
        Subnet_ID = IP_Address_octets[0] + "." + Subnet_ID_second_octet + "." + "0" + "." + "0";
        Broadcast = IP_Address_octets[0] + "." + (Subnet_ID_second_octet + IP_octet - 1) + "." + "255" + "." + "255";
        Usuable_IP_Address_range = IP_Address_octets[0] + "." + Subnet_ID_second_octet + "." + "0" + "." + "1" + " - " +  IP_Address_octets[0] + "." + (Subnet_ID_second_octet + IP_octet-1) + "." + "255" + "." + "254";
    }
    if(CIDR < 8){ 
        let IP_octet = Math.pow(2, 8 - CIDR);
        let Subnet_ID_first_octet = Math.trunc(IP_Address_octets[0]/IP_octet)*IP_octet; 
        Subnet_ID = Subnet_ID_first_octet + "." + "0" + "." + "0" + "." + "0";
        Broadcast = (Subnet_ID_first_octet + IP_octet - 1) + "." + "255" + "." + "255" + "." + "255";
        Usuable_IP_Address_range = Subnet_ID_first_octet + "." + "0" + "." + "0" + "." + "1" + " - " +  (Subnet_ID_first_octet + IP_octet -1) + "." + "255" + "." + "255" + "." + "254";
    }
    let OBJ_Range_ID_Broadcast = {
        Subnet_ID: Subnet_ID,
        Broadcast: Broadcast,
        Usuable_IP_Address_range: Usuable_IP_Address_range
    }
    return OBJ_Range_ID_Broadcast;
}

//Main function that calls almost all other functions
function Analyze(IP_Address, Subnetmask) {
    Subnetmask = Subnetmask.toString(); 
    const Subnetmask1 = Subnetmask;
    let Subnetmask_octets = Subnetmask.split("."); 
    let IP_Address_octets = IP_Address.split("."); 
    let VAR_CIDR_Notation;
    let VAR_Subnetmask_Notation;
    let VAR_IP_Class;
    let VAR_Binary_Subnetmask;
    let VAR_TotalNumberofHosts;
    let VAR_UsableNumberofHosts;
    let OBJ_Range_ID_Broadcast;

    document.getElementById("CheckvalidityofIP").innerHTML = null;
   
    if (ValidIP(IP_Address_octets) && ValidSubnetmask(Subnetmask1)) { 
        VAR_IP_Class = IPClass(IP_Address_octets);
        VAR_CIDR_Notation = CIDR_Notation(Subnetmask_octets);
        VAR_Subnetmask_Notation = Subnetmask_Notation(Subnetmask_octets);
        let VAR_Subnetmask_Notation_array = VAR_Subnetmask_Notation.split(".");
        VAR_Binary_Subnetmask = Binary_Subnetmask(VAR_Subnetmask_Notation_array);
        VAR_TotalNumberofHosts = TotalNumberofHosts(VAR_CIDR_Notation);
        VAR_UsableNumberofHosts = UsableNumberofHosts(VAR_CIDR_Notation);
        OBJ_Range_ID_Broadcast = IPrange(VAR_CIDR_Notation, IP_Address_octets);
        let Subnet_information = {
            IP_Address: IP_Address,
            Usuable_IP_Address_range: OBJ_Range_ID_Broadcast.Usuable_IP_Address_range,
            Network_Address: OBJ_Range_ID_Broadcast.Subnet_ID,
            Broadcast: OBJ_Range_ID_Broadcast.Broadcast,
            Subnetmask: VAR_Subnetmask_Notation,
            CIDR_Notation: VAR_CIDR_Notation,
            IP_Class: VAR_IP_Class,
            Binary_Subnetmask: VAR_Binary_Subnetmask,
            TotalNumberofHosts: VAR_TotalNumberofHosts,
            UsableNumberofHosts: VAR_UsableNumberofHosts
        };
        PrintToHTML(Subnet_information);
        AddToAllcalculatedSubnets(Subnet_information);
        PrintAllCalculatedSubnetsToHTML();
        Donation();
    }
    if(ValidIP(IP_Address_octets) && !ValidSubnetmask(Subnetmask1)) {
        document.getElementById("CheckvalidityofIP").innerHTML = "Invalid Subnetmask";
    }
    if(!ValidIP(IP_Address_octets) && ValidSubnetmask(Subnetmask1)){
        document.getElementById("CheckvalidityofIP").innerHTML = "Invalid IP Address";
    }
    if (!ValidIP(IP_Address_octets) && !ValidSubnetmask(Subnetmask1)){
        document.getElementById("CheckvalidityofIP").innerHTML = "Invalid IP Address and invalid Subnetmask";
    }
}

//Prints the different informations to the HTML table
function PrintToHTML(Subnet_information){
    document.getElementById("HTML_IP_Address").innerHTML = Subnet_information.IP_Address;
    document.getElementById("HTML_Usuable_IP_Address_range").innerHTML = Subnet_information.Usuable_IP_Address_range;
    document.getElementById("HTML_Subnet_ID").innerHTML = Subnet_information.Network_Address;
    document.getElementById("HTML_Broadcast").innerHTML = Subnet_information.Broadcast;
    document.getElementById("HTML_Subnetmask").innerHTML = Subnet_information.Subnetmask;
    document.getElementById("HTML_CIDR_Notation").innerHTML = Subnet_information.CIDR_Notation; 
    document.getElementById("HTML_Networkclass").innerHTML = Subnet_information.IP_Class;       
    document.getElementById("HTML_Subnetmask_Binary").innerHTML = Subnet_information.Binary_Subnetmask;
    document.getElementById("HTML_TotalNumberofHosts").innerHTML = Subnet_information.TotalNumberofHosts;
    document.getElementById("HTML_UsableNumberofHosts").innerHTML = Subnet_information.UsableNumberofHosts;  
}

//Adds an property to the object AllcalculatedSubnets which contains all subnets which have been calculated so far
function AddToAllcalculatedSubnets(Subnet_information){
    Subnetcounter++;
    let Propertyname = "Subnetnumber" + Subnetcounter;
    AllcalculatedSubnets[Propertyname] = "Nr" + Subnetcounter + "," + Subnet_information.Usuable_IP_Address_range + "," + Subnet_information.Network_Address + "," + Subnet_information.Broadcast + "," + Subnet_information.Subnetmask + "," + Subnet_information.CIDR_Notation + "," + Subnet_information.IP_Class + "," + Subnet_information.Binary_Subnetmask + "," + Subnet_information.TotalNumberofHosts + "," + Subnet_information.UsableNumberofHosts;
}

//Prints the already calculated subnets to HTML
function PrintAllCalculatedSubnetsToHTML(){
    let CalculatedSubnets = ""
    for (let property in AllcalculatedSubnets){
        CalculatedSubnets += AllcalculatedSubnets[property] + "<br>";
    }
    document.getElementById("HTML_CalculatedSubnets").innerHTML = CalculatedSubnets;
}

//Creates the body of the CSV which can be downloaded, it contains all calculated subnets
function CreateCSVContent (){
    let CSV_Content = "";
    for (let property in AllcalculatedSubnets){
        CSV_Content += AllcalculatedSubnets[property] + "\n";
    }
    return CSV_Content;
}

//Downloads a CSV with all the calculated subnets and their information
function Download_CSV(){
    let csv = CreateCSVContent();
    csv = csv.toString();
    let hiddenElement = document.createElement("a");
    hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
    hiddenElement.target = "_blank";
    hiddenElement.download = "Calculated_Subnets.csv";
    hiddenElement.click();
}

//Calculates the next subnet ID of the next Subnet and runs the function Analyze with those values 
function NextSubnet(){
    let Subnet_ID = document.getElementById("HTML_Subnet_ID").innerHTML;
    let Subnet_ID_octets = Subnet_ID.split(".");
    Subnet_ID_octets = Subnet_ID_octets.map(function (x){ 
        return Number(x);
    }) 
    let VAR_CIDR_Notation = Number(document.getElementById("HTML_CIDR_Notation").innerHTML);
    let new_Subnet_ID;
    let IP_octet4_calcdata = Math.pow(2, 32 - VAR_CIDR_Notation);
    let IP_octet3_calcdata = Math.pow(2, 24 - VAR_CIDR_Notation);
    let IP_octet2_calcdata = Math.pow(2, 16 - VAR_CIDR_Notation);
    let IP_octet1_calcdata = Math.pow(2, 8 - VAR_CIDR_Notation);
    if(VAR_CIDR_Notation > 24){
        if(Subnet_ID_octets[3] + IP_octet4_calcdata < 256){
            Subnet_ID_octets[3] += IP_octet4_calcdata;
        }
        else if(Subnet_ID_octets[3] + IP_octet4_calcdata == 256){
            if(Subnet_ID_octets[2] < 255){
                Subnet_ID_octets[2] += 1;
                Subnet_ID_octets[3] = "0";
            }
            else if(Subnet_ID_octets[2] == 255){
                if(Subnet_ID_octets[1] < 255){
                    Subnet_ID_octets[1] += 1;
                    Subnet_ID_octets[2] = "0";
                    Subnet_ID_octets[3] = "0"; 
                }
                else if(Subnet_ID_octets[1] == 255){
                    if(Subnet_ID_octets[0] < 255){
                        Subnet_ID_octets[0] += 1;
                        Subnet_ID_octets[1] = "0";
                        Subnet_ID_octets[2] = "0"; 
                        Subnet_ID_octets[3] = "0";
                    }
                    else if (Subnet_ID_octets[0] == 255){
                        alert("The current Subnet is the last possible Subnet");
                        return;
                    }
                }
            }
        }
    }
    if(VAR_CIDR_Notation <= 24 && VAR_CIDR_Notation > 16){
        if(Subnet_ID_octets[2] + IP_octet3_calcdata < 256){
            Subnet_ID_octets[2] += IP_octet3_calcdata;
            Subnet_ID_octets[3] = "0";
        }
        else if(Subnet_ID_octets[2] + IP_octet3_calcdata == 256){
            if(Subnet_ID_octets[1] < 255){
                Subnet_ID_octets[1] += 1;
                Subnet_ID_octets[2] = "0";
                Subnet_ID_octets[3] = "0";
            }
            else if(Subnet_ID_octets[1] == 255){
                if(Subnet_ID_octets[0] < 255){
                    Subnet_ID_octets[0] += 1;
                    Subnet_ID_octets[1] = "0";
                    Subnet_ID_octets[2] = "0";
                    Subnet_ID_octets[3] = "0";
                }
                else if(Subnet_ID_octets[0] == 255){
                    alert("The current Subnet is the last possible Subnet");
                    return;
                }
            }
        }
    }
    if(VAR_CIDR_Notation <= 16 && VAR_CIDR_Notation > 8){
        if(Subnet_ID_octets[1] + IP_octet2_calcdata < 256){
            Subnet_ID_octets[1] += IP_octet2_calcdata;
            Subnet_ID_octets[2] = "0";
            Subnet_ID_octets[3] = "0";
        }
        else if(Subnet_ID_octets[1] + IP_octet2_calcdata == 256){
            if(Subnet_ID_octets[0] < 255){
                Subnet_ID_octets[0] += 1;
                Subnet_ID_octets[1] = "0";
                Subnet_ID_octets[2] = "0";
                Subnet_ID_octets[3] = "0";
            }
            else if(Subnet_ID_octets[0] == 255){
                alert("The current Subnet is the last possible Subnet");
                return;
            }
        }
    }
    if(VAR_CIDR_Notation <= 8 && VAR_CIDR_Notation > 0){
        if(Subnet_ID_octets[0] + IP_octet1_calcdata < 256){
            Subnet_ID_octets[0] += IP_octet1_calcdata;
            Subnet_ID_octets[1] = "0";
            Subnet_ID_octets[2] = "0";
            Subnet_ID_octets[3] = "0";        
        }
        else if(Subnet_ID_octets[0] + IP_octet1_calcdata > 255){
            alert("The current Subnet is the last possible Subnet");
            return;
        }
    }
    new_Subnet_ID = Subnet_ID_octets.join(".");
    Analyze(new_Subnet_ID, VAR_CIDR_Notation);
    document.getElementById("HTML_IP_Address").innerHTML = undefined; //IP does not exist when moving to the next Subnet
}

//Asks for a donation after 25, 50 or 100 subnets have been calculated, uses local storage so that the counter is not reset each time the website gets reloaded 
function Donation(){
    let CounterOfCalculatedSubnets = undefined;
    try {
        if (localStorage.getItem("NrofCalculatedSubnets") === null) {
            throw "Local Storage item NrofCalculatedSubnets not set yet, will be set to Nr: 0"
          }
        CounterOfCalculatedSubnets = JSON.parse(localStorage.getItem("NrofCalculatedSubnets"));
        } catch (error) {
            console.log(error);
            localStorage.setItem("NrofCalculatedSubnets", JSON.stringify({Nr: 0}));
            CounterOfCalculatedSubnets = JSON.parse(localStorage.getItem("NrofCalculatedSubnets"));
      }
    finally{
        CounterOfCalculatedSubnets = Number(CounterOfCalculatedSubnets.Nr) + 1;
        localStorage.setItem("NrofCalculatedSubnets", JSON.stringify({Nr: CounterOfCalculatedSubnets}));
    }
    if(CounterOfCalculatedSubnets == 25 || CounterOfCalculatedSubnets == 50 || CounterOfCalculatedSubnets == 100){
        let myWindow = window.open("", "MsgWindow", "width=700,height=200");
        myWindow.document.write("<h1>Thanks You for using my Subnetcalculator</h1><br><b>You have calculated exactly " + CounterOfCalculatedSubnets + " Subnets using this Subnetcalculator, you clearly love to use it :) If the Subnetcalculator has been usefull to you please consider to donate me a Coffee @ https://www.buymeacoffee.com/"); 
    }
}
