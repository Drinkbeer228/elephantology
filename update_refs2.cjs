const fs = require('fs');

const data = {
  "docs/conservation/spatial-ecology-and-connectivity-corridors.md": `references:
  - id: "ref_douglas_hamilton_2005"
    title: "Movements and corridors of African elephants in relation to protected areas"
    authors: "Douglas-Hamilton I., Krink T., Vollrath F."
    year: 2005
    doi: "10.1007/s00114-004-0606-9"
  - id: "ref_de_2021"
    title: "Pan-India population genetics signifies the importance of habitat connectivity for wild Asian elephant conservation"
    authors: "De R., Sharma R., Davidar P., et al."
    year: 2021
    doi: "10.1016/j.gecco.2021.e01888"
  - id: "ref_roever_2013"
    title: "Functional connectivity within conservation networks: Delineating corridors for African elephants"
    authors: "Roever C. A., van Aarde R. J., Leggett K."
    year: 2013
    doi: "10.1016/j.biocon.2012.09.011"
  - id: "ref_wittemyer_2007"
    title: "The influence of environment on systematic and seasonal patterns of elephant movement"
    authors: "Wittemyer G., Getz W. M., Vollrath F., Douglas-Hamilton I."
    year: 2007`,
  "docs/veterinary/chemical-immobilization-and-anesthesia.md": `references:
  - id: "ref_kock_2012"
    title: "Chemical and Physical Restraint of Wild Animals: A Training and Field Manual"
    authors: "Kock M. D., Burroughs R."
    year: 2012
  - id: "ref_west_2014"
    title: "Zoo Animal and Wildlife Immobilization and Anesthesia"
    authors: "West G., Heard D., Caulkett N."
    year: 2014
  - id: "ref_fowler_2006"
    title: "Biology, Medicine, and Surgery of Elephants"
    authors: "Fowler M. E., Mikota S. K."
    year: 2006
  - id: "ref_morkel_2010"
    title: "Preventing positional cardiopulmonary collapse during prolonged lateral recumbency in African elephants"
    authors: "Morkel P., Gerhardt R."
    year: 2010
  - id: "ref_glaser_2009"
    title: "Clinical evaluation of thiafentanil oxalate (A3080) in captive Asian elephants"
    authors: "Glaser A. L., Hildebrandt T. B."
    year: 2009`,
  "docs/veterinary/elephant-neonatology-and-calves.md": `references:
  - id: "ref_brown_1995"
    title: "Serum and urinary hormones during pregnancy and the peri- and postpartum period in an Asian elephant (Elephas maximus)"
    authors: "Brown J. L., Lehnhardt J."
    year: 1995
    doi: "10.1002/zoo.1430140608"
  - id: "ref_hodges_1998"
    title: "The endocrine control of reproduction in the female elephant"
    authors: "Hodges J. K."
    year: 1998
    doi: "10.1016/S0378-4320(98)00138-7"
  - id: "ref_takehana_2022"
    title: "Clinical review of Elephant endotheliotropic herpes virus (EEHV) associated disease in Asian elephants"
    authors: "Takehana K., Kawakami S., Thitaram C., Matsuno K."
    year: 2022
  - id: "ref_peters_1972"
    title: "Composition and nutrient content of elephant (Elephas maximus) milk"
    authors: "Peters J. M., et al."
    year: 1972
    doi: "10.2307/1379051"
  - id: "ref_lee_1986"
    title: "Early maternal investment in male and female African elephant calves"
    authors: "Lee P. C., Moss C. J."
    year: 1986
    doi: "10.1007/BF00300004"`,
  "docs/culture/china-elephant-retreat-and-environmental-history.md": `references:
  - id: "ref_elvin_2004"
    title: "The Retreat of the Elephants: An Environmental History of China"
    authors: "Elvin M."
    year: 2004
  - id: "ref_zhang_2015"
    title: "Asian elephants in China: estimating population size and evaluating habitat suitability"
    authors: "Zhang L., Dong L., Lin L., Feng L., Yan F., Wang L., Guo X., Luo A."
    year: 2015
    doi: "10.1371/journal.pone.0124834"
  - id: "ref_wen_1995"
    title: "Studies on changes in plants and animals in China during historical times"
    authors: "Wen H., et al."
    year: 1995
  - id: "ref_sukumar_2003"
    title: "The Living Elephants: Evolutionary Ecology, Behavior, and Conservation"
    authors: "Sukumar R."
    year: 2003
  - id: "ref_shoshani_1982"
    title: "Mammalian Species No. 182: Elephas maximus"
    authors: "Shoshani J., Eisenberg J. F."
    year: 1982`,
  "docs/culture/war-elephants-history-tactics-and-veterinary.md": `references:
  - id: "ref_trautmann_2015"
    title: "Elephants and Kings: An Environmental History"
    authors: "Trautmann T. R."
    year: 2015
  - id: "ref_scullard_1974"
    title: "The Elephant in the Greek and Roman World"
    authors: "Scullard H. H."
    year: 1974
  - id: "ref_kistler_2006"
    title: "War Elephants"
    authors: "Kistler J. M."
    year: 2006
  - id: "ref_gowers_1947"
    title: "The African elephant in warfare"
    authors: "Gowers W."
    year: 1947
  - id: "ref_sukumar_2003"
    title: "The Living Elephants: Evolutionary Ecology, Behavior, and Conservation"
    authors: "Sukumar R."
    year: 2003`,
  "docs/taxonomy/proboscidea-early-evolution-and-stem-groups.md": `references:
  - id: "ref_gheerbrant_1998"
    title: "Phosphatherium escuilliei du Thanétien du Bassin des Ouled Abdoun (Maroc), plus ancien proboscidien (Mammalia) d'Afrique"
    authors: "Gheerbrant E., Sudre J., Cappetta H., Bignot G."
    year: 1998
    doi: "10.1016/S0016-6995(98)80041-7"
  - id: "ref_gheerbrant_2009"
    title: "Paleocene emergence of elephant relatives and the rapid radiation of African ungulates"
    authors: "Gheerbrant E."
    year: 2009
    doi: "10.1073/pnas.0900251106"
  - id: "ref_sanders_2022"
    title: "Evolution and Fossil Record of African Proboscidea"
    authors: "Sanders W. J."
    year: 2022
  - id: "ref_liu_2008"
    title: "Stable isotope evidence for an amphibious phase in early proboscidean evolution"
    authors: "Liu A. G. S. C., Seiffert E. R., Simons E. L."
    year: 2008
    doi: "10.1073/pnas.0800884105"
  - id: "ref_shoshani_1996"
    title: "The Proboscidea: Evolution and Palaeoecology of Elephants and Their Relatives"
    authors: "Shoshani J., Tassy P."
    year: 1996`
};

for (const [file, refBlock] of Object.entries(data)) {
  if (!fs.existsSync(file)) {
    console.error("File not found:", file);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (match) {
    const newFrontmatter = match[1] + "\n" + refBlock;
    content = content.replace(/^---\n([\s\S]*?)\n---/, "---\n" + newFrontmatter + "\n---");
    fs.writeFileSync(file, content);
    console.log("Updated", file);
  } else {
    console.error("Could not find frontmatter in", file);
  }
}
