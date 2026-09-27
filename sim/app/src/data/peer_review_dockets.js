/**
 * Confederated Sortition Peer-Review Dockets (Agent SIM-3)
 * Implements accessible, human-centric community dilemmas
 * between autonomous federated nodes (Detroit, Val di Susa, Yukon, Sahel, etc.)
 *
 * Gate D8 Compliant: Universal English Base with Registered i18n StringIDs.
 *
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 */

export const CONFEDERATED_DOCKETS = [
  {
    id: 'docket-sim-qa-01',
    code: 'QA-01',
    originNodeId: 'detroit',
    originNodeName: 'Detroit Delray Commons',
    originBioregionIcon: '🏭',
    titleKey: 'docket_qa01_title',
    title: 'Assembly size in small villages',
    domainKey: 'docket_domain_governance',
    domain: 'Governance & Labor Shifts',
    targetArticles: 'Art. 4.2',
    speaker: 'Marcus Vance (Pioneer at Detroit):',
    quoteKey: 'docket_qa01_quote',
    quote: '"We are only 28 people. If 15 of us spend all day in meetings, who tends the greenhouses and solar panels? We could run out of food!"',
    problemKey: 'docket_qa01_problem',
    problem: 'The strict rule of 15 councilors ties up over half the population in small villages, pulling needed hands away from fields and workshops.',
    hypothesisKey: 'docket_qa01_hypothesis',
    hypothesis: 'Adapt council size: 3 drawn citizens for villages under 50 people, 15 in larger hubs. Decisions remain democratic without pulling labor from the land.',
    telemetryKey: 'docket_qa01_telemetry',
    telemetry: 'Testing in Detroit prevented food shortages and maintained full rotation.',
    optionA: {
      labelKey: 'docket_qa01_optA_label',
      label: 'Approve a smaller 3-person council',
      descKey: 'docket_qa01_optA_desc',
      description: 'Reduce council size to 3 citizens for villages under 50 people. +10% work efficiency, +12 Morale.',
      moraleDelta: +12,
      confederalTrust: +15,
      perkId: 'subsidiarityQuorum',
      perkKey: 'docket_qa01_optA_perk',
      perkSummary: '+10% shift efficiency; +15 Confederal Trust.'
    },
    optionB: {
      labelKey: 'docket_qa01_optB_label',
      label: 'Keep the rigid 15-person council',
      descKey: 'docket_qa01_optB_desc',
      description: 'Keep 15 mandatory councilors no matter what. More bureaucracy and heavier shifts in the field.',
      moraleDelta: -6,
      confederalTrust: -5,
      perkId: null,
      perkKey: 'docket_qa01_optB_perk',
      perkSummary: 'Rigid 15-person quorum kept; heavier labor shifts.'
    }
  },
  {
    id: 'docket-sim-qa-02',
    code: 'QA-02',
    originNodeId: 'valdisusa',
    originNodeName: 'Val di Susa Alpine Commons',
    originBioregionIcon: '🏔️',
    titleKey: 'docket_qa02_title',
    title: 'Personal tools or shared library?',
    domainKey: 'docket_domain_property',
    domain: 'Commons & Property',
    targetArticles: 'Art. 2.2',
    speaker: 'Sofia Rossi (Artisan in Val di Susa):',
    quoteKey: 'docket_qa02_quote',
    quote: '"A surgeon or woodcarver cherishes fine tools. Nobody wants their precision chisels mixed in with heavy digging shovels!"',
    problemKey: 'docket_qa02_problem',
    problem: 'Everyone needs a drill or a ladder once in a while, but buying 20 identical drills is wasteful. At the same time, artisans worry their fine personal tools will get damaged if shared.',
    hypothesisKey: 'docket_qa02_hypothesis',
    hypothesis: 'Distinguish tool categories: personal trade tools remain inviolable; heavy, occasional machinery (ladders, drills, power washers) joins the civic tool library.',
    telemetryKey: 'docket_qa02_telemetry',
    telemetry: 'Tool expenditures cut by 75% with zero artisan friction.',
    optionA: {
      labelKey: 'docket_qa02_optA_label',
      label: 'Approve shared community tool library',
      descKey: 'docket_qa02_optA_desc',
      description: 'Protects personal specialized tools while sharing heavy, occasional equipment. -15% wear, +14 Morale.',
      moraleDelta: +14,
      confederalTrust: +15,
      materialsGained: { steelKg: 10 },
      perkId: 'dualTierTools',
      perkKey: 'docket_qa02_optA_perk',
      perkSummary: '-15% machinery wear; artisan tools protected.'
    },
    optionB: {
      labelKey: 'docket_qa02_optB_label',
      label: 'Reject (Either all private or all shared)',
      descKey: 'docket_qa02_optB_desc',
      description: 'No clear rule: disputes among artisans and wasteful duplicate gear.',
      moraleDelta: -8,
      confederalTrust: -10,
      perkId: null,
      perkKey: 'docket_qa02_optB_perk',
      perkSummary: 'No shared tool library; duplicate tool waste.'
    }
  },
  {
    id: 'docket-sim-qa-03',
    code: 'QA-03',
    originNodeId: 'yukon',
    originNodeName: 'Yukon-Alaska Sub-Glacial Station',
    originBioregionIcon: '🌲',
    titleKey: 'docket_qa03_title',
    title: 'Water sensors: trust computers or check in person?',
    domainKey: 'docket_domain_telemetry',
    domain: 'Water & Environmental Telemetry',
    targetArticles: 'Art. 3.4',
    speaker: 'Kenjiro Sato (Yukon Technician):',
    quoteKey: 'docket_qa03_quote',
    quote: '"Frost and algae clog the water probes. The computer didn’t notice until two volunteers went out with measuring rods to test the water by hand."',
    problemKey: 'docket_qa03_problem',
    problem: 'Automated sensors get dirty or lose calibration over time. Computers don’t always notice, risking unnoticed leaks or pollutants.',
    hypothesisKey: 'docket_qa03_hypothesis',
    hypothesis: 'Include quick visual inspections and weekly manual verifications in citizen chores to confirm sensor accuracy.',
    telemetryKey: 'docket_qa03_telemetry',
    telemetry: '100% of telemetry anomalies caught, preventing aqueduct failures.',
    optionA: {
      labelKey: 'docket_qa03_optA_label',
      label: 'Approve weekly manual checks by citizens',
      descKey: 'docket_qa03_optA_desc',
      description: 'Quick weekly visual inspections to confirm sensor readings. +20% water reliability, +10 Morale.',
      moraleDelta: +10,
      confederalTrust: +20,
      perkId: 'analogGroundTruthing',
      perkKey: 'docket_qa03_optA_perk',
      perkSummary: '+20% water network reliability; zero hidden leaks.'
    },
    optionB: {
      labelKey: 'docket_qa03_optB_label',
      label: 'Trust only automated computer sensors',
      descKey: 'docket_qa03_optB_desc',
      description: 'No human checks; risk of hidden sensor drift and unflagged leaks.',
      moraleDelta: -4,
      confederalTrust: 0,
      perkId: null,
      perkKey: 'docket_qa03_optB_perk',
      perkSummary: 'Automated-only telemetry; unflagged drift risks.'
    }
  },
  {
    id: 'docket-sim-qa-04',
    code: 'QA-04',
    originNodeId: 'sahel',
    originNodeName: 'Sahel Agroforestry Biome',
    originBioregionIcon: '🌾',
    titleKey: 'docket_qa04_title',
    title: '3D printer shifts and stopping favoritism',
    domainKey: 'docket_domain_fablabs',
    domain: 'FabLab & Common Workshops',
    targetArticles: 'Art. 2.1',
    speaker: 'Amina Diallo (Sahel Network Guardian):',
    quoteKey: 'docket_qa04_quote',
    quote: '"Workshop machines to build robots are always busy. Some people booked morning slots just to trade them to friends for favors. Now if you don’t show up in 15 minutes, your slot goes to the next person."',
    problemKey: 'docket_qa04_problem',
    problem: 'High-demand workshop machines were being booked in advance to trade favors or gain personal privileges.',
    hypothesisKey: 'docket_qa04_hypothesis',
    hypothesis: 'Make reservations personal and non-transferable: slots auto-expire after 15 minutes of absence, immediately rolling over to the next drawn pioneer.',
    telemetryKey: 'docket_qa04_telemetry',
    telemetry: 'Zero favor trading; machine utilization reaches 100% with no idle downtime.',
    optionA: {
      labelKey: 'docket_qa04_optA_label',
      label: 'Approve the fair-use rule',
      descKey: 'docket_qa04_optA_desc',
      description: 'Personal bookings expire automatically after 15 minutes if unused. +25% workshop speed, +12 Morale.',
      moraleDelta: +12,
      confederalTrust: +20,
      perkId: 'soulboundFabLabQueues',
      perkKey: 'docket_qa04_optA_perk',
      perkSummary: '+25% FabLab speed; stops slot hoarding.'
    },
    optionB: {
      labelKey: 'docket_qa04_optB_label',
      label: 'Allow trading booking slots freely',
      descKey: 'docket_qa04_optB_desc',
      description: 'Free trading of reservations among friends, risking favoritism and idle machine time.',
      moraleDelta: -6,
      confederalTrust: -5,
      perkId: null,
      perkKey: 'docket_qa04_optB_perk',
      perkSummary: 'Tradeable queue slots; favoritism risks.'
    }
  }
];
