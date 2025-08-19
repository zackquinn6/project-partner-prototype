-- Add tile flooring tools to library
INSERT INTO tools (item, description, example_models) VALUES
('Notched Trowel', 'Used for spreading and combing thinset mortar with consistent ridges', '1/4" x 3/8" Square Notch, 3/16" x 5/32" V-Notch'),
('Rubber Grout Float', 'For applying and smoothing grout between tiles', 'Marshalltown, QEP'),
('Tile Cutter', 'Manual scoring tool for straight cuts on ceramic tiles', 'QEP 10600BR, Sigma Pull Handle'),
('Wet Tile Saw', 'Electric saw with water cooling for precise tile cuts', 'DEWALT D24000, RIDGID R4092'),
('Tile Nippers', 'Hand tool for making small curved cuts and notches', 'QEP 10018Q, Marshalltown 826'),
('Rubber Mallet', 'For gently tapping tiles into place without damage', '16 oz Dead Blow, Estwing'),
('Chalk Line Reel', 'For marking straight reference lines on subfloor', 'Irwin Strait-Line, Johnson Level'),
('Level (4ft)', 'For checking tile alignment and floor flatness', 'STABILA, Johnson Level'),
('Mixing Paddle', 'Drill attachment for mixing thinset and grout', 'QEP Spiral Mixer, DEWALT'),
('Tile Spacers Set', 'Plastic spacers to maintain consistent gaps between tiles', '1/16", 1/8", 3/16", 1/4" cross spacers'),
('Grout Sponge', 'Dense sponge for cleaning excess grout from tile surface', 'Hydra Grout Sponge, QEP Large Tile Sponge'),
('Knee Pads', 'Protection for extended floor work', 'Professional gel-filled knee pads');

-- Add tile flooring materials to library  
INSERT INTO materials (item, description, unit_size) VALUES
('Ceramic Floor Tile', 'Durable ceramic tiles suitable for floor installation', 'Per sq ft'),
('Porcelain Floor Tile', 'Dense, water-resistant porcelain tiles for floors', 'Per sq ft'),
('Unmodified Thinset Mortar', 'Cement-based adhesive for bonding tiles to substrate', '50 lb bag'),
('Modified Thinset Mortar', 'Polymer-modified adhesive for enhanced bond strength', '50 lb bag'),
('Sanded Grout', 'Grout with sand aggregate for joints 1/8" and wider', '25 lb bag'),
('Unsanded Grout', 'Smooth grout for narrow joints less than 1/8"', '25 lb bag'),
('Tile Membrane (Uncoupling)', 'Waterproof membrane that prevents crack transfer', 'Per sq ft'),
('Waterproof Membrane Tape', 'Sealing tape for membrane seams and transitions', 'Linear ft'),
('Grout Sealer', 'Protective coating to prevent staining and moisture', 'Per quart'),
('Silicone Caulk', 'Flexible sealant for expansion joints and perimeters', 'Per tube'),
('Tile Spacers', 'Plastic crosses and T-shaped spacers for consistent gaps', 'Per bag (100 pcs)'),
('Leveling Compound', 'Self-leveling compound for uneven subfloors', '50 lb bag'),
('Grout Haze Remover', 'Acidic cleaner for removing grout residue from tiles', 'Per quart'),
('Drop Cloth', 'Protective covering for adjacent surfaces', 'Per piece');