import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProjectActions } from '@/contexts/ProjectActionsContext';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const TILE_FLOORING_TABLE_DATA = `|Flow|Phase|Operation|Step|Description|Outputs|Inputs|
|-|-|-|-|-|-|-|
|If nec|Prep|Project Setup|Furniture and belongings move|Remove furniture, fixtures, and personal items; protect adjacent surfaces|No personal areas affected by dust|* Furniture qty<br/>* Distance to project|
|If nec|Prep|Project Setup|Heavy appliance move|Remove large appliances such as refrigerators|No personal areas affected by dust|* Furniture qty<br/>* Distance to project|
|Prime|Prep|Project Setup|Work station setup|Position mixing tools, water supply, cutting tools, and waste bins within easy reach while keeping the main floor clear.|No personal areas affected by dust|* Distance to project|
|Prime|Prep|Project Setup|Work station setup|Position mixing tools, water supply, cutting tools, and waste bins within easy reach while keeping the main floor clear.|Driveway / hard surfaces protected from dust|* Distance to project|
|Prime|Prep|Project Setup|Work station setup|Position mixing tools, water supply, cutting tools, and waste bins within easy reach while keeping the main floor clear.|Setup:<br/>Workbench, mixing area with water supply, cutting table, re-useable scraps, and final waste tile.|* Distance to project|
|Prime|Prep|Project Setup|Materials staging|Lay out tile boxes in installation order; pre-open shrink wrap to acclimate tiles to room temperature and humidity.|No personal areas affected by dust|* Duration check method|
|Prime|Prep|Project Setup|Materials staging|Lay out tile boxes in installation order; pre-open shrink wrap to acclimate tiles to room temperature and humidity.|Acclimation time passed mfg minimum|* Duration check method|
|IF nec|Prep|Hazardous materials removal|Remove hazardous materials|If old adhesives or flooring contain asbestos or lead, hire a certified abatement contractor and follow containment protocols.|Hazardous materials remove and disposed of in compliance with federal, state, and local building codes|* Compliance reqts<br/>* Hazardous material type|
|Prime|Prep|Demo|Remove non-hazardous materials|Strip carpet, vinyl, or existing tile down to the substrate; use scrapers and floor scrubbing tools to clear residue.|Old materials removed from floor|* Flooring materials volume<br/>* Material type<br/>* Nail volume|
|If nec|Prep|Demo|Remove tile (>100sqft)|Strip tile using machine|Tile removed from floor|* Flooring materials volume<br/>* Material type<br/>* Nail volume|
|IF nec|Prep|Demo|Remove wall trim and prepare walls|Remove trim and loose materials from walls|Old materials removed from wall|* Stud location marking<br/>* Caulk cutting/paint scoring<br/>* Nail volume|
|IF nec|Prep|Demo|Remove wall trim and prepare walls|Remove trim and loose materials from walls|No paint tears|* Stud location marking<br/>* Caulk cutting/paint scoring<br/>* Nail volume|
|IF nec|Prep|Demo|Remove wall trim and prepare walls|Remove trim and loose materials from walls|No dents to drywall above baseboard|* Stud location marking<br/>* Caulk cutting/paint scoring<br/>* Nail volume|
|IF nec|Prep|Demo|Remove wall trim and prepare walls|Remove trim and loose materials from walls|No cracking to baseboard materials|* Stud location marking<br/>* Caulk cutting/paint scoring<br/>* Nail volume|
|IF nec|Prep|Demo|Remove toilet|Remove toilet from bathroom floor|Toilet removed||
|IF nec|Prep|Demo|Remove toilet|Remove toilet from bathroom floor|Wax residue removed|*Toilet type/install method<br/>*Bolt rust<br/>*Lifting method<br/>*Water level<br/>*Water valve control|
|IF nec|Prep|Demo|Remove toilet|Remove toilet from bathroom floor|Flange condition inspected and documented|*Toilet type/install method<br/>*Bolt rust<br/>*Lifting method<br/>*Water level<br/>*Water valve control|
|IF nec|Prep|Demo|Remove toilet|Remove toilet from bathroom floor|Toilet drain pipe plugged|*Toilet type/install method<br/>*Bolt rust<br/>*Lifting method<br/>*Water level<br/>*Water valve control|
|IF nec|Prep|Demo|Remove toilet|Remove toilet from bathroom floor|No water spilled in house|*Toilet type/install method<br/>*Bolt rust<br/>*Lifting method<br/>*Water level<br/>*Water valve control|
|Prime|Prep|Demo - wood floor|Detailed finishing and prep|Fill cracks or low spots with patching compound; sand protrusions to achieve a uniform, flat surface.|Nails removed|* Surface inspection method|
|Prime|Prep|Demo - wood floor|Detailed finishing and prep|Fill cracks or low spots with patching compound; sand protrusions to achieve a uniform, flat surface.|No loose debris / contamination|* Surface inspection method|
|Prime|Prep|Demo - wood floor|Detailed finishing and prep|Fill cracks or low spots with patching compound; sand protrusions to achieve a uniform, flat surface.|Loose boards screwed down|* Surface inspection method|
|IF nec|Prep|Subfloor prep|Prep concrete|If concrete surface is not smooth, grind concrete slabs to remove laitance and improve thinset adhesion.|Concrete surface roughness prepared for thinset - 100% coverage|*Grinding method<br/>*High point marking<br/>*High point identification method<br/>*Verification method|
|IF nec|Prep|Subfloor prep|Prep concrete|If concrete surface is not smooth, grind concrete slabs to remove laitance and improve thinset adhesion.|No high points >1/8" in 10ft for natural stone, 1/4" in 10ft for ceramic/porcelain|*Grinding method<br/>*High point marking<br/>*High point identification method<br/>*Verification method|
|Prime|Prep|Assess floor|Measure|Re-verify dimensions after demo to account for any substrate changes; adjust layout plans as needed. Check moisture using moisture meter.|Condition report:|* Inspection method<br/>*|
|Prime|Prep|Assess floor|Measure|Re-verify dimensions after demo to account for any substrate changes; adjust layout plans as needed. Check moisture using moisture meter.|Moisture level|* Inspection method<br/>*|
|Prime|Prep|Assess floor|Measure|Re-verify dimensions after demo to account for any substrate changes; adjust layout plans as needed. Check moisture using moisture meter.|Level|* Inspection method<br/>*|
|Prime|Prep|Assess floor|Measure|Re-verify dimensions after demo to account for any substrate changes; adjust layout plans as needed. Check moisture using moisture meter.|Subfloor thickness|* Inspection method<br/>*|
|Prime|Prep|Assess floor|Measure|Re-verify dimensions after demo to account for any substrate changes; adjust layout plans as needed. Check moisture using moisture meter.|Subfloor material|* Inspection method<br/>*|
|Prime|Prep|Assess floor|Measure|Re-verify dimensions after demo to account for any substrate changes; adjust layout plans as needed. Check moisture using moisture meter.|Transition zones|* Inspection method<br/>*|
|Prime|Prep|Assess floor|Measure|Re-verify dimensions after demo to account for any substrate changes; adjust layout plans as needed. Check moisture using moisture meter.|Moulding heights|* Inspection method<br/>*|
|IF nec|Prep|Subfloor prep|Install plywood subfloor|If subfloor thickness is <1-1/4"<br/>Screw down exterior-grade plywood over joists to create a stiff, screw-retention layer under tile.|Subfloor total thickness >1-1/4", no layer <3/8"|* Adhevsive coverage and thickness<br/>* Screwing pattern|
|IF nec|Prep|Subfloor prep|Install plywood subfloor|If subfloor thickness is <1-1/4"<br/>Screw down exterior-grade plywood over joists to create a stiff, screw-retention layer under tile.|Screws at least every 6"; no closer than 1/2" from edge|* Adhevsive coverage and thickness<br/>* Screwing pattern|
|IF nec|Prep|Subfloor prep|Install plywood subfloor|If subfloor thickness is <1-1/4"<br/>Screw down exterior-grade plywood over joists to create a stiff, screw-retention layer under tile.|Construction adhesive 95% applied to joists / underlying base|* Adhevsive coverage and thickness<br/>* Screwing pattern|
|IF nec|Prep|Subfloor prep|Apply self-leveler|If subfloor flatness is not 1/8" in 10ft or not level,<br/>Pour and spread self-leveling compound to smooth minor dips|Smooth - 1/8" in 10ft|* Surface cleanliness<br/>* Primer application<br/>* Mix consitnecy<br/>* Application time since mix<br/>* Mfg of self-leveler<br/>* Spread method<br/>* Gauge rake setting|
|IF nec|Prep|Subfloor prep|Apply self-leveler|If subfloor flatness is not 1/8" in 10ft or not level,<br/>Pour and spread self-leveling compound to smooth minor dips|Adhesion of layer in mfg spec|* Surface cleanliness<br/>* Primer application<br/>* Mix consitnecy<br/>* Application time since mix<br/>* Mfg of self-leveler<br/>* Spread method<br/>* Gauge rake setting|
|IF nec|Prep|Subfloor prep|Apply self-leveler|If subfloor flatness is not 1/8" in 10ft or not level,<br/>Pour and spread self-leveling compound to smooth minor dips|No drips to lower levels/outside project floor|* Surface cleanliness<br/>* Primer application<br/>* Mix consitnecy<br/>* Application time since mix<br/>* Mfg of self-leveler<br/>* Spread method<br/>* Gauge rake setting|
|IF nec|Prep|Subfloor prep|Apply self-leveler|If subfloor flatness is not 1/8" in 10ft or not level,<br/>Pour and spread self-leveling compound to smooth minor dips|Max thickness per mfg spec|* Surface cleanliness<br/>* Primer application<br/>* Mix consitnecy<br/>* Application time since mix<br/>* Mfg of self-leveler<br/>* Spread method<br/>* Gauge rake setting|
|Prime|Prep|Cleaning|Clean tools|Remove thinset from tools|Thinset completely removed from tools|* Thinset waste location; water rinse duration<br/>* Thinset removal accuracy|
|Prime|Prep|Cleaning|Clean tools|Remove thinset from tools|Thinset not settling in drains|* Thinset waste location; water rinse duration<br/>* Thinset removal accuracy|
|IF nec|Prep|Subfloor prep|Cure self leveler|Allow leveler cure time before proceeding.|Wait time passed in line with manufacturer recommendation|* Manufacturer specification<br/>* Time track method|
|Alt|Prep|Tile base install|Install concrete board|If using concrete board,<br/>Fasten cement board panels with corrosion-resistant screws; tape seams with fiber mesh to prevent movement cracks.|Screws every 6", not closer than 1" from edge|* Thinset coverage<br/>* Trowel size<br/>* Screw pattern<br/>* Layout plan|
|Alt|Prep|Tile base install|Install concrete board|If using concrete board,<br/>Fasten cement board panels with corrosion-resistant screws; tape seams with fiber mesh to prevent movement cracks.|Thinset coverage and strength|* Thinset coverage<br/>* Trowel size<br/>* Screw pattern<br/>* Layout plan|
|Alt|Prep|Tile base install|Install concrete board|If using concrete board,<br/>Fasten cement board panels with corrosion-resistant screws; tape seams with fiber mesh to prevent movement cracks.|Seam staggering|* Thinset coverage<br/>* Trowel size<br/>* Screw pattern<br/>* Layout plan|
|Alt|Prep|Tile base install|Install concrete board|If using concrete board,<br/>Fasten cement board panels with corrosion-resistant screws; tape seams with fiber mesh to prevent movement cracks.|Seam 100% coverage with tape|* Thinset coverage<br/>* Trowel size<br/>* Screw pattern<br/>* Layout plan|
|Alt|Prep|Tile base install|Install concrete board|If using concrete board,<br/>Fasten cement board panels with corrosion-resistant screws; tape seams with fiber mesh to prevent movement cracks.|Floor gaps 1/4"-1/2"|* Thinset coverage<br/>* Trowel size<br/>* Screw pattern<br/>* Layout plan|
|Alt|Prep|Tile base install|Install uncoupling membrane|If using uncoupling membrane,<br/>Roll out and bond a membrane to isolate tile from substrate stresses and manage moisture.|Thinset coverage and strength|* Trowel size<br/>* Trowel angle<br/>* Towel direction<br/>* Setting pressure<br/>* Setting force direction<br/>* Layout plan<br/>* Thinset type|
|Alt|Prep|Tile base install|Install uncoupling membrane|If using uncoupling membrane,<br/>Roll out and bond a membrane to isolate tile from substrate stresses and manage moisture.|Seam 100% coverage with tape|* Trowel size<br/>* Trowel angle<br/>* Towel direction<br/>* Setting pressure<br/>* Setting force direction<br/>* Layout plan<br/>* Thinset type|
|Alt|Prep|Tile base install|Install uncoupling membrane|If using uncoupling membrane,<br/>Roll out and bond a membrane to isolate tile from substrate stresses and manage moisture.|Floor gaps 1/4"-1/2"|* Trowel size<br/>* Trowel angle<br/>* Towel direction<br/>* Setting pressure<br/>* Setting force direction<br/>* Layout plan<br/>* Thinset type|
|Prime|Prep|Cleaning|Clean tools|Remove thinset from tools|Thinset completely removed from tools|* Thinset waste location; water rinse duration<br/>* Thinset removal accuracy|
|Prime|Prep|Layout|Plan layout|Plan layout using digital tools|reference walls defined|* Accurate measurements w/ grout<br/>* Reference walls|
|Prime|Prep|Layout|Plan layout|Plan layout using digital tools|starting line defined|* Accurate measurements w/ grout<br/>* Reference walls|
|Prime|Prep|Layout|Plan layout|Plan layout using digital tools|min 2" or 1/3 width on all tiles|* Accurate measurements w/ grout<br/>* Reference walls|
|Prime|Prep|Layout|Plan layout|Plan layout using digital tools|balanced spacing|* Accurate measurements w/ grout<br/>* Reference walls|
|Prime|Prep|Layout|Plan layout|Plan layout using digital tools|setting order defined (planning for no-walk on tile)|* Accurate measurements w/ grout<br/>* Reference walls|
|Prime|Prep|Layout|Plan layout|Plan layout using digital tools|grout line per design; min 1/16"|* Accurate measurements w/ grout<br/>* Reference walls|
|Prime|Prep|Layout|Plan layout|Plan layout using digital tools|Movement joint every 25ft|* Accurate measurements w/ grout<br/>* Reference walls|
|Prime|Prep|Layout|Dry test layout|Test layout for critical zones|Layout plan|* Layout plan<br/>* Tile handling method|
|Prime|Prep|Layout|Dry test layout|Test layout for critical zones|No broken tiles|* Layout plan<br/>* Tile handling method|
|Prime|Install|Cut|Wet saw cut|Use a water-cooled tile saw for straight, precise cuts on ceramic, porcelain, or natural stone.|Cut according to size - +/-1/16"|* Saw blade condition<br/>* Feed rate<br/>* Water flow<br/>* Cut location along marking line (+/- 1/16")<br/>* Guide fence<br/>* Layout: high-stress cuts<br/>* Plunge cuts and drilling|
|Prime|Install|Cut|Wet saw cut|Use a water-cooled tile saw for straight, precise cuts on ceramic, porcelain, or natural stone.|Round cut according to profile - +/-1/4"|* Saw blade condition<br/>* Feed rate<br/>* Water flow<br/>* Cut location along marking line (+/- 1/16")<br/>* Guide fence<br/>* Layout: high-stress cuts<br/>* Plunge cuts and drilling|
|Prime|Install|Cut|Wet saw cut|Use a water-cooled tile saw for straight, precise cuts on ceramic, porcelain, or natural stone.|No cracking of tile in-plane|* Saw blade condition<br/>* Feed rate<br/>* Water flow<br/>* Cut location along marking line (+/- 1/16")<br/>* Guide fence<br/>* Layout: high-stress cuts<br/>* Plunge cuts and drilling|
|Prime|Install|Cut|Snap & score cut|For thinner tiles, use a handheld snap cutter: score the glaze, snap the tile along the line, and smooth edges with a rubbing stone.|Straight cut according to size - +/-1/16"|* Marking layout - using wax pencil or sharpie<br/>* Roller wheel condition<br/>* Score pressure<br/>* Snap pressure<br/>* Cut location along marking line (+/- 1/16")<br/>* Guide fence|
|Prime|Install|Cut|Snap & score cut|For thinner tiles, use a handheld snap cutter: score the glaze, snap the tile along the line, and smooth edges with a rubbing stone.|No cracking of tile in-plane|* Marking layout - using wax pencil or sharpie<br/>* Roller wheel condition<br/>* Score pressure<br/>* Snap pressure<br/>* Cut location along marking line (+/- 1/16")<br/>* Guide fence|
|Prime|Install|Cut|Grinder cut|Use an angle grinder with a diamond blade for curved or notched cuts|Round cut according to size - +/-1/4"|* Saw blade condition<br/>* Feed rate<br/>* Water flow<br/>* Cut location along marking line (+/- 1/16")<br/>* Wheel speed<br/>* Wheel feed|
|Prime|Install|Cut|Grinder cut|Use an angle grinder with a diamond blade for curved or notched cuts|Straight cut according to size - +/-1/8"|* Saw blade condition<br/>* Feed rate<br/>* Water flow<br/>* Cut location along marking line (+/- 1/16")<br/>* Wheel speed<br/>* Wheel feed|
|Prime|Install|Cut|Grinder cut|Use an angle grinder with a diamond blade for curved or notched cuts|No cracking of tile in-plane|* Saw blade condition<br/>* Feed rate<br/>* Water flow<br/>* Cut location along marking line (+/- 1/16")<br/>* Wheel speed<br/>* Wheel feed|
|Prime|Install|Cut|Cut trim|For metal edge profiles, cut to size|Cut within +/-1/32"|* Marking layout<br/>* Cut location along marking line (+/- 1/16")|
|Prime|Install|Cut|Drill|Fit tiles to pipes or other fixtures by drilling pilot holes first, then widen with a diamond-tipped bit under water spray.|No cracking of tile in-plane|* Drill condition<br/>* Water flow<br/>* Drill pressure<br/>* Drill guide<br/>* Starting method<br/>* Drill spin speed|
|Prime|Install|Cut|Drill|Fit tiles to pipes or other fixtures by drilling pilot holes first, then widen with a diamond-tipped bit under water spray.|Hole diameter outside of 1/4" from plan|* Drill condition<br/>* Water flow<br/>* Drill pressure<br/>* Drill guide<br/>* Starting method<br/>* Drill spin speed|
|Prime|Install|Cut|Drill|Fit tiles to pipes or other fixtures by drilling pilot holes first, then widen with a diamond-tipped bit under water spray.|Hole true position within 1/8"|* Drill condition<br/>* Water flow<br/>* Drill pressure<br/>* Drill guide<br/>* Starting method<br/>* Drill spin speed|
|Prime|Install|Cut|Polish|Smooth cut edges and chamfers with a fine-grit diamond grinder or hand scraper for a professional finish.|No cracking of tile in-plane|* UPSTREAM: Cut speed<br/>* UPSTREAM: Water flow<br/>* Polishing grit<br/>* Polishing speed<br/>* Polishing pressure<br/>* Polishing location|
|Prime|Install|Cut|Polish|Smooth cut edges and chamfers with a fine-grit diamond grinder or hand scraper for a professional finish.|No visible chips on edge (no magnification, 4" distance)|* UPSTREAM: Cut speed<br/>* UPSTREAM: Water flow<br/>* Polishing grit<br/>* Polishing speed<br/>* Polishing pressure<br/>* Polishing location|
|Prime|Install|Cut|Polish|Smooth cut edges and chamfers with a fine-grit diamond grinder or hand scraper for a professional finish.|Inner corner radius maintained per layout|* UPSTREAM: Cut speed<br/>* UPSTREAM: Water flow<br/>* Polishing grit<br/>* Polishing speed<br/>* Polishing pressure<br/>* Polishing location|
|Prime|Install|Cut|Polish|Smooth cut edges and chamfers with a fine-grit diamond grinder or hand scraper for a professional finish.|<1/64" matl removal|* UPSTREAM: Cut speed<br/>* UPSTREAM: Water flow<br/>* Polishing grit<br/>* Polishing speed<br/>* Polishing pressure<br/>* Polishing location|
|Repeat|Install|Mix|Mix thinset|Combine mortar and water to a lump-free, peanut-butter consistency; slake (rest) then remix before use.|Peanut-butter consistency and no unmixed contents|* Water and thinset volume per mfg spec<br/>* Mix time (Min 5min)<br/>* Mix speed<br/>* Paddle type|
|Repeat|Install|Mix|Mix thinset|Combine mortar and water to a lump-free, peanut-butter consistency; slake (rest) then remix before use.|End time of mix logged|* Water and thinset volume per mfg spec<br/>* Mix time (Min 5min)<br/>* Mix speed<br/>* Paddle type|
|Repeat|Install|Set|Clean floor|Clean floor|No contamination||
|Repeat|Install|Set|Apply thinset|Spread mortar with a notched trowel at the correct angle and depth to achieve complete coverage and target bed thickness.|95% thinset coverage|* Time since mix completion<br/>* Trowel notch size<br/>* Trowel coverage<br/>* Handlnig method<br/>* Hard points near tile|
|Repeat|Install|Set|Apply thinset|Spread mortar with a notched trowel at the correct angle and depth to achieve complete coverage and target bed thickness.|Thinset thickness <1/8"|* Time since mix completion<br/>* Trowel notch size<br/>* Trowel coverage<br/>* Handlnig method<br/>* Hard points near tile|
|Repeat|Install|Set|Apply thinset|Spread mortar with a notched trowel at the correct angle and depth to achieve complete coverage and target bed thickness.|Tiles undamaged|* Time since mix completion<br/>* Trowel notch size<br/>* Trowel coverage<br/>* Handlnig method<br/>* Hard points near tile|
|Repeat|Install|Set|Set tile|Press and wiggle each tile into the mortar bed, maintaining consistent spacing with wedges or spacers and periodic level checks.|Lippage <1/32"|* UPSTREAM: Floor flatness<br/>* UPSTREAM: Layout pattern<br/>* UPSTREAM: Grout size<br/>* UPSTREAM: Tile flatness<br/>* Thinset volume<br/>* Thinset consistency<br/>* Thinset troweling<br/>* Thinset time since mix<br/>* Leveling system pressure<br/>* Location of leveling spacers<br/>* Tile setting pressure too low<br/>* Tile setting wiggle too little<br/>* Floor contamination|
|Repeat|Install|Set|Set tile|Press and wiggle each tile into the mortar bed, maintaining consistent spacing with wedges or spacers and periodic level checks.|Thinset coverage 95% in wet zones, 80% in dry zones|* For sheet-tile/mosaics especially pebble - remove pieces and place indiviaully<br/>* Back butter application|
|Repeat|Install|Set|Set tile|Press and wiggle each tile into the mortar bed, maintaining consistent spacing with wedges or spacers and periodic level checks.|Grout line size per spec (+/- <1/64")|* For sheet-tile/mosaics especially pebble - remove pieces and place indiviaully<br/>* Back butter application<br/>* Leveling system tightness|
|Repeat|Install|Set|Set tile|Press and wiggle each tile into the mortar bed, maintaining consistent spacing with wedges or spacers and periodic level checks.|Layout per plan (+/- 1/4")|* For sheet-tile/mosaics especially pebble - remove pieces and place indiviaully<br/>* Back butter application|
|Repeat|Install|Set|Set tile|Press and wiggle each tile into the mortar bed, maintaining consistent spacing with wedges or spacers and periodic level checks.|Grout nominal centerline must be straight|* For sheet-tile/mosaics especially pebble - remove pieces and place indiviaully<br/>* Back butter application|
|Repeat|Install|Set|Set tile|Press and wiggle each tile into the mortar bed, maintaining consistent spacing with wedges or spacers and periodic level checks.|Thinset lower than 1/8" from tile suface|* Thinset volume near clips<br/>* Thinset volume|
|Repeat|Install|Set|Set tile|Press and wiggle each tile into the mortar bed, maintaining consistent spacing with wedges or spacers and periodic level checks.|Thinset time from mix within mfg spec - 1hr max duration|* For sheet-tile/mosaics especially pebble - remove pieces and place indiviaully<br/>* Back butter application|
|Repeat|Install|Set|Set tile|Press and wiggle each tile into the mortar bed, maintaining consistent spacing with wedges or spacers and periodic level checks.|No visible sheet lines|* For sheet-tile/mosaics especially pebble - remove pieces and place indiviaully<br/>* Back butter application|
|Inspect|Install|Set|Verify tile coverage|Remove tile and check coverage according to plan, re-install|Coverage >80% in floor, 95% in bath|* Check-point adhserence|
|Inspect|Install|Set|Correct layout|Inspect grout lines and make ongoing corrections to align layout|Grout line size per plan|* Visual check<br/>* Layout plan|
|Alt|Install|Install tile trim and baseboard|Install tile trim and baseboard|Fit bullnose profiles or baseboards at tile edges for a clean termination and edge protection.|Lippage <1/32"|* For sheet-tile/mosaics especially pebble - remove pieces and place indiviaully<br/>* Back butter application|
|Alt|Install|Install tile trim and baseboard|Install tile trim and baseboard|Fit bullnose profiles or baseboards at tile edges for a clean termination and edge protection.|Thinset coverage 95% in wet zones, 80% in dry zones|* For sheet-tile/mosaics especially pebble - remove pieces and place indiviaully<br/>* Back butter application|
|Alt|Install|Install tile trim and baseboard|Install tile trim and baseboard|Fit bullnose profiles or baseboards at tile edges for a clean termination and edge protection.|Grout line size per spec (+/- <1/64")|* For sheet-tile/mosaics especially pebble - remove pieces and place indiviaully<br/>* Back butter application|
|Alt|Install|Install tile trim and baseboard|Install tile trim and baseboard|Fit bullnose profiles or baseboards at tile edges for a clean termination and edge protection.|Layout per plan (+/- 1/4")|* For sheet-tile/mosaics especially pebble - remove pieces and place indiviaully<br/>* Back butter application|
|Alt|Install|Install tile trim and baseboard|Install tile trim and baseboard|Fit bullnose profiles or baseboards at tile edges for a clean termination and edge protection.|Grout nominal centerline must be straight|* For sheet-tile/mosaics especially pebble - remove pieces and place indiviaully<br/>* Back butter application|
|Alt|Install|Install tile trim and baseboard|Install tile trim and baseboard|Fit bullnose profiles or baseboards at tile edges for a clean termination and edge protection.|Thinset time from mix within mfg spec - 1hr max duration|* For sheet-tile/mosaics especially pebble - remove pieces and place indiviaully<br/>* Back butter application|
|Alt|Install|Install tile trim and baseboard|Install tile trim and baseboard|Fit bullnose profiles or baseboards at tile edges for a clean termination and edge protection.|Seated to wall|* For sheet-tile/mosaics especially pebble - remove pieces and place indiviaully<br/>* Back butter application|
|Prime|Install|Set|Clean thinset from tile|Using sponge and toothbrush, clean thinset from tile tops and in grout lines|Thinset >1/8" from surface in grout line|* Cleaning pressure<br/>* UPSTREAM: Excess grout volume<br/>* Tile leveling spacer qty|
|Prime|Install|Set|Clean thinset from tile|Using sponge and toothbrush, clean thinset from tile tops and in grout lines|Thinset coverage removed from tile|* Cleaning pressure<br/>* UPSTREAM: Excess grout volume<br/>* Tile leveling spacer qty|
|IF nec|Install|Pausing mid-project|Prepare stop point|Cut space for leveling spacers and remove loose thinset|Thinset removed from flooring not covered by tile|* Thinset removal accuracy<br/>* Tile setting pressure|
|IF nec|Install|Pausing mid-project|Prepare stop point|Cut space for leveling spacers and remove loose thinset|Leveling clip added where next layer will be|* Thinset removal accuracy<br/>* Tile setting pressure|
|IF nec|Install|Pausing mid-project|Prepare stop point|Cut space for leveling spacers and remove loose thinset|Tile set tight to leveling clip|* Thinset removal accuracy<br/>* Tile setting pressure|
|Prime|Finish|Cleaning|Clean tools|Remove thinset from tools|Thinset completely removed from tools|* Thinset waste location; water rinse duration<br/>* Thinset removal accuracy|
|Prime|Install|Thinset curing|Cure thinset|Permanently set thinset|Tile lippage <1/32"|* Wait time<br/>* Humidity<br/>* Ambient temp|
|Prime|Install|Thinset curing|Cure thinset|Permanently set thinset|Thinset 100% cured|* Wait time<br/>* Humidity<br/>* Ambient temp|
|Prime|Install|Leveling system removal|Remove leveling clips|Snap off and remove leveling clips from tile surface|Level clips 100% removed|* Strike force<br/>* Strike angle|
|Prime|Install|Leveling system removal|Remove leveling clips|Snap off and remove leveling clips from tile surface|Breaklines >1/8" below surface|* Strike force<br/>* Strike angle|
|Prime|Finish|Grout & caulk|Tile cleaning|Remove excess thinset from tile surface and grout lines|Thinset >1/8" from surface in grout line|*UPSTREAM: Incomplete cleaning<br/>* Cleaning / scraping pressure|
|Prime|Finish|Grout & caulk|Tile cleaning|Remove excess thinset from tile surface and grout lines|Thinset coverage removed from tile|*UPSTREAM: Incomplete cleaning<br/>* Cleaning / scraping pressure|
|Prime|Finish|Grout & caulk|Grout|Fill joints with grout using a rubber float, working diagonally across tiles to compact and wipe excess grout from edges.|100% coverage of grout lines|* Time since mix completion<br/>* Grout float angle<br/>* Cleaning force<br/>* Grout line coverage|
|Prime|Finish|Grout & caulk|Grout|Fill joints with grout using a rubber float, working diagonally across tiles to compact and wipe excess grout from edges.|No grout on tile|* Time since mix completion<br/>* Grout float angle<br/>* Cleaning force<br/>* Grout line coverage|
|Prime|Finish|Grout & caulk|Grout|Fill joints with grout using a rubber float, working diagonally across tiles to compact and wipe excess grout from edges.|Tooled radius in grout line|* Time since mix completion<br/>* Grout float angle<br/>* Cleaning force<br/>* Grout line coverage|
|Prime|Finish|Grout & caulk|Grout|Fill joints with grout using a rubber float, working diagonally across tiles to compact and wipe excess grout from edges.|No grout in change of planes (corners)|* Time since mix completion<br/>* Grout float angle<br/>* Cleaning force<br/>* Grout line coverage|
|Prime|Finish|Grout & caulk|Grout|Fill joints with grout using a rubber float, working diagonally across tiles to compact and wipe excess grout from edges.|Grout integrity|* Time since mix completion<br/>* Grout float angle<br/>* Cleaning force<br/>* Grout line coverage|
|Prime|Finish|Cleaning|Clean tools|Remove thinset from tools|Thinset completely removed from tools|* Thinset waste location; water rinse duration<br/>* Thinset removal accuracy|
|Prime|Finish|Grout & caulk|Caulk|Seal perimeter and transition joints with a flexible, mildew-resistant caulk that matches grout color to accommodate movement.|Caulk 100% covered|* Grout tip size<br/>* Expelled volume<br/>* Tape / masking placement|
|Prime|Finish|Grout & caulk|Caulk|Seal perimeter and transition joints with a flexible, mildew-resistant caulk that matches grout color to accommodate movement.|Caulk shaped with no reversals, defects or tile coverage|* Grout tip size<br/>* Expelled volume<br/>* Tape / masking placement|
|If nec|Finish|Seal|Seal|Apply penetrating or topical sealer to grout (and natural stone) to protect against stains and moisture ingress.|Sealant applied to 100% of grout|* Tape placement<br/>* Sealant application volume<br/>* Sealant coverage|
|If nec|Finish|Seal|Seal|Apply penetrating or topical sealer to grout (and natural stone) to protect against stains and moisture ingress.|No sealant applied to tile|* Tape placement<br/>* Sealant application volume<br/>* Sealant coverage|
|If nec|Finish|Seal|Seal|Apply penetrating or topical sealer to grout (and natural stone) to protect against stains and moisture ingress.|Sealant protected from water and contamination for mfg-spec'd duration, at least 2hr|* Tape placement<br/>* Sealant application volume<br/>* Sealant coverage|
|Alt|Finish|Install wood trim and baseboard|Install wood trim and baseboard|Reattach or install new wood moldings, mitered at corners, and nail them to the wall studs clear of the tile field.|Moldings nailed per pattern|* Baseboard cut length<br/>* Baseboard miter angle<br/>* UPSTREAM: Wall flatness<br/>* UPSTREAM: tile floor flatness|
|Alt|Finish|Install wood trim and baseboard|Install wood trim and baseboard|Reattach or install new wood moldings, mitered at corners, and nail them to the wall studs clear of the tile field.|Moldings tight to wall|* Baseboard cut length<br/>* Baseboard miter angle<br/>* UPSTREAM: Wall flatness<br/>* UPSTREAM: tile floor flatness|
|Alt|Finish|Install wood trim and baseboard|Install wood trim and baseboard|Reattach or install new wood moldings, mitered at corners, and nail them to the wall studs clear of the tile field.|No visible gaps to wall or in wood trim|* Baseboard cut length<br/>* Baseboard miter angle<br/>* UPSTREAM: Wall flatness<br/>* UPSTREAM: tile floor flatness|
|Alt|Finish|Install wood trim and baseboard|Install wood trim and baseboard|Reattach or install new wood moldings, mitered at corners, and nail them to the wall studs clear of the tile field.|No caulk applied to wood-plane|* Baseboard cut length<br/>* Baseboard miter angle<br/>* UPSTREAM: Wall flatness<br/>* UPSTREAM: tile floor flatness|
|If nec|Finish|Install toilet|Install toilet|Install toilet on to new toilet floor|Toilet bolts mounted tight|* Flange height relative to finished floor<br/>* Toilet type<br/>* Toilet lift method<br/>* Toilet install method<br/>* Wax/seal type<br/>* Bolt length<br/>* Bolt alignment<br/>* Lifting mechanism vs weight|
|If nec|Finish|Install toilet|Install toilet|Install toilet on to new toilet floor|Toilet flat|* Flange height relative to finished floor<br/>* Toilet type<br/>* Toilet lift method<br/>* Toilet install method<br/>* Wax/seal type<br/>* Bolt length<br/>* Bolt alignment<br/>* Lifting mechanism vs weight|
|If nec|Finish|Install toilet|Install toilet|Install toilet on to new toilet floor|Toilet gap <1/8"|* Flange height relative to finished floor<br/>* Toilet type<br/>* Toilet lift method<br/>* Toilet install method<br/>* Wax/seal type<br/>* Bolt length<br/>* Bolt alignment<br/>* Lifting mechanism vs weight|
|If nec|Finish|Install toilet|Install toilet|Install toilet on to new toilet floor|Toilet caulked to floor|* Flange height relative to finished floor<br/>* Toilet type<br/>* Toilet lift method<br/>* Toilet install method<br/>* Wax/seal type<br/>* Bolt length<br/>* Bolt alignment<br/>* Lifting mechanism vs weight|
|Prime|Finish|Complete project|Document completion|Using app, take photos, complete workflows, and provide feedback|Photos, workflow, feedback completed|* Flange height relative to finished floor<br/>* Toilet type<br/>* Toilet lift method<br/>* Toilet install method<br/>* Wax/seal type<br/>* Bolt length<br/>* Bolt alignment<br/>* Lifting mechanism vs weight|
|Prime|Finish|Prep for pickup|Prep for pickup|Clean tools and add to packaging|Tools cleaned per cleaning plan|* Checklist & packaging method|
|Prime|Finish|Prep for pickup|Prep for pickup|Clean tools and add to packaging|100% of tools returned|* Checklist & packaging method|
|Prime|Finish|Materials disposal|Store leftover materials|Maintain a small collection of materials for future reference and replacement|5 full pieces stored safely - packaged in bubblewrap|* Storage location<br/>* Storage packaging<br/>* Item volume|
|Prime|Finish|Materials disposal|Dispose of waste tile and leftover materials|Remove materials from property|Materials removed from property|* Waste compliance regulations<br/>* Disposal method|
|Prime|Finish|Materials disposal|Dispose of waste tile and leftover materials|Remove materials from property|Nails not sticking out of wood/materials|* Waste compliance regulations<br/>* Disposal method|
|Prime|Finish|Materials disposal|Dispose of waste tile and leftover materials|Remove materials from property|Local waste compliance met|* Waste compliance regulations<br/>* Disposal method|
|Prime|Finish|Post-install inspection|Inspect grout and tile|Check for cracks in grout and tile|100% inspection completed under standard conditions|* Inspection distance (spec: 36" from walls and 60" from floor)<br/>* Inspection coverage|`;

export const TileFlooringImportButton: React.FC = () => {
  const { importTileFlooringProject } = useProjectActions();
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      await importTileFlooringProject(TILE_FLOORING_TABLE_DATA);
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Button 
      onClick={handleImport} 
      disabled={isImporting}
      variant="default"
      className="w-full"
    >
      {isImporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Importing...
        </>
      ) : (
        <>
          <Upload className="w-4 h-4 mr-2" />
          Import Tile Flooring Project
        </>
      )}
    </Button>
  );
};
