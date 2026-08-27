const fs = require('fs');

const data = {
  "docs/cognition/cooperation-and-problem-solving.md": `references:
  - id: "ref_plotnik_2011"
    title: "Cooperative problem solving in Asian elephants"
    authors: "Plotnik J. M., Lair R., Suphachoksahakun W., de Waal F. B. M."
    year: 2011
    doi: "10.1073/pnas.1105439108"
  - id: "ref_foerder_2011"
    title: "Insightful Problem Solving in an Asian Elephant"
    authors: "Foerder P., Galloway M., Muir T., Reiss D."
    year: 2011
    doi: "10.1371/journal.pone.0023253"
  - id: "ref_hart_2001"
    title: "Cognitive behaviour in Asian elephants: use and modification of branches for fly switching"
    authors: "Hart B. L., Hart L. A., McCoy M., Sarath C. R."
    year: 2001
    doi: "10.1006/anbe.2001.1815"
  - id: "ref_byrne_2016"
    title: "Evolving Insight"
    authors: "Byrne R. W."
    year: 2016
  - id: "ref_poole_1998"
    title: "An Exploration of a Commonality between Ourselves and Elephants"
    authors: "Poole J. H."
    year: 1998`,
  "docs/ethogram/aggression-dominance-and-reconciliation.md": `references:
  - id: "ref_moss_1983"
    title: "Relationships and social structure in African elephants"
    authors: "Moss C. J., Poole J. H."
    year: 1983
  - id: "ref_wittemyer_2005"
    title: "The socioecology of elephants: analysis of the processes creating multitiered social structures"
    authors: "Wittemyer G., Douglas-Hamilton I., Getz W. M."
    year: 2005
    doi: "10.1016/j.anbehav.2004.08.018"
  - id: "ref_poole_1982"
    title: "Musth and male-male competition in the African elephant"
    authors: "Poole J. H."
    year: 1982
  - id: "ref_de_waal_2008"
    title: "Do elephants show empathy? Consolation and post-conflict affiliation"
    authors: "de Waal F. B. M., Plotnik J. M."
    year: 2008
  - id: "ref_mccomb_2011"
    title: "Leadership in elephants: the adaptive value of age in matriarchs"
    authors: "McComb K., Shannon G., Durant S. M., Sayialel K., Slotow R., Poole J., Moss C."
    year: 2011
    doi: "10.1098/rspb.2011.0168"`,
  "docs/ethogram/chemosensory-communication-and-vomeronasal-system.md": `references:
  - id: "ref_rasmussen_1998"
    title: "Chemical signals in the reproduction of Asian and African elephants"
    authors: "Rasmussen L. E. L., Schulte B. A."
    year: 1998
    doi: "10.1016/S0378-4320(98)00125-9"
  - id: "ref_niimura_2014"
    title: "Extreme expansion of the olfactory receptor gene repertoire in African elephants"
    authors: "Niimura Y., Matsui A., Touhara K."
    year: 2014
    doi: "10.1101/gr.169532.113"
  - id: "ref_rasmussen_2005"
    title: "Behavioral and chemical confirmation of the preovulatory pheromone, (Z)-7-dodecenyl acetate, in wild Asian elephants: Its relationship to musth"
    authors: "Rasmussen L. E. L., Krishnamurthy V., Sukumar R."
    year: 2005
  - id: "ref_bagley_2006"
    title: "Male African elephants (Loxodonta africana) can distinguish oestrous status via urinary signals"
    authors: "Bagley K. R., Goodwin T. E., Rasmussen L. E. L., Schulte B. A."
    year: 2006
    doi: "10.1016/j.anbehav.2005.10.014"
  - id: "ref_rasmussen_1996"
    title: "The sensorimotor specializations of the trunk tip of the Asian elephant, Elephas maximus"
    authors: "Rasmussen L. E. L., Munger B. L."
    year: 1996`,
  "docs/ethogram/fission-fusion-social-structure.md": `references:
  - id: "ref_wittemyer_2005"
    title: "The socioecology of elephants: analysis of the processes creating multitiered social structures"
    authors: "Wittemyer G., Douglas-Hamilton I., Getz W. M."
    year: 2005
    doi: "10.1016/j.anbehav.2004.08.018"
  - id: "ref_archie_2006"
    title: "The ties that bind: genetic relatedness predicts the fission and fusion of social groups in wild African elephants"
    authors: "Archie E. A., Moss C. J., Alberts S. C."
    year: 2006
    doi: "10.1098/rspb.2005.3361"
  - id: "ref_mccomb_2001"
    title: "Matriarchs as repositories of social knowledge in African elephants"
    authors: "McComb K., Moss C., Durant S. M., Baker L., Sayialel S."
    year: 2001
    doi: "10.1126/science.1057895"
  - id: "ref_shannon_2013"
    title: "Effects of social disruption in elephants persist decades after culling"
    authors: "Shannon G., Slotow R., Durant S. M., Sayialel K. N., Poole J., Moss C., McComb K."
    year: 2013
    doi: "10.1186/1742-9994-10-62"
  - id: "ref_pardo_2024"
    title: "African elephants address one another with individually specific name-like calls"
    authors: "Pardo M. A., Fristrup K., Lolchuragi D. S., Poole J. H., et al."
    year: 2024
    doi: "10.1038/s41559-024-02420-w"`,
  "docs/conservation/human-elephant-conflict-mitigation.md": `references:
  - id: "ref_sukumar_2003"
    title: "The Living Elephants: Evolutionary Ecology, Behavior, and Conservation"
    authors: "Sukumar R."
    year: 2003
  - id: "ref_king_2007"
    title: "Beehive fences as effective deterrents for crop-raiding African elephants"
    authors: "King L. E., Lawrence D., Douglas-Hamilton I., Vollrath F."
    year: 2007
    doi: "10.1016/j.cub.2007.07.038"
  - id: "ref_sitati_2003"
    title: "Predicting spatial patterns of human-elephant conflict in the Masai Mara ecosystem, Kenya"
    authors: "Sitati N. W., Walpole C. E., Smith R. J., Leader-Williams N."
    year: 2003
    doi: "10.1046/j.1365-2664.2003.00844.x"
  - id: "ref_fernando_2008"
    title: "Community-based electric fencing as a mitigation tool for human-elephant conflict"
    authors: "Fernando P., Kumar M. A., Williams A. C., et al."
    year: 2008
    doi: "10.1016/j.biocon.2008.05.023"
  - id: "ref_wittemyer_2007"
    title: "The influence of environment on systematic and seasonal patterns of elephant movement"
    authors: "Wittemyer G., Getz W. M., Vollrath F., Douglas-Hamilton I."
    year: 2007`,
  "docs/conservation/ivory-trade-and-forensic-genetics.md": `references:
  - id: "ref_wasser_2015"
    title: "Genetic assignment of large seizures of elephant ivory reveals Africa's major poaching hotspots"
    authors: "Wasser S. K., Brown L., Mailand C., et al."
    year: 2015
    doi: "10.1126/science.aaa2457"
  - id: "ref_campbell_staton_2021"
    title: "Ivory poaching and the rapid evolution of tusklessness in African elephants"
    authors: "Campbell-Staton S. C., Arnold B. J., Gonçalves D., Granli P., Poole J., et al."
    year: 2021
    doi: "10.1126/science.abe7389"
  - id: "ref_uno_2013"
    title: "Bomb-curve radiocarbon measurement of recent biologic tissues and applications to wildlife forensics and stable isotope (paleo)ecology"
    authors: "Uno K. T., Quade J., Fisher D. C., et al."
    year: 2013
    doi: "10.1073/pnas.1302226110"
  - id: "ref_wasser_2008"
    title: "Combating the illegal ivory trade with biology"
    authors: "Wasser S. K., Clark W. J., Drori O., et al."
    year: 2008
    doi: "10.1111/j.1523-1739.2008.01012.x"
  - id: "ref_cerling_2009"
    title: "Stable isotope ecology of modern elephants"
    authors: "Cerling T. E., Wittemyer G., Ehleringer J. R., et al."
    year: 2009`
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
