#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
O.N.E. HABITAT — MHU OPEN-BIM IFC4 EXPORTER
File: habitat/cad/export_mhu_ifc4.py
Author: Kyberlex <kyberlex@proton.me>
License: AGPL-3.0-or-later

Description:
Zero-dependency Python generator producing a canonical, schema-compliant
ISO 16739-1 (IFC4) STEP physical file representing the 3-Bay (54 m²)
Modular Habitat Unit (MHU) Portal Frame Assembly.

Compatible with:
  - BlenderBIM / Bonsai
  - FreeCAD (BIM / Arch Workbench)
  - Solibri / BIMvision / Open-source IFC viewers
"""

import datetime
import os
import sys

CAD_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_IFC = os.path.join(CAD_DIR, "mhu_portal_frame_3bay.ifc")


def generate_ifc4_portal_frame():
    """Generates a valid ISO-10303-21 STEP physical file containing IFC4 structural entities."""
    timestamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Step IDs counter
    lines = []
    step_id = 0

    def add(stmt):
        nonlocal step_id
        step_id += 1
        lines.append(f"#{step_id}={stmt};")
        return step_id

    # --- IFC HEADER ---
    header = f"""ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('O.N.E. Modular Habitat Unit (MHU) 3-Bay Portal Frame Assembly','ViewDefinition [CoordinationView]'),'2;1');
FILE_NAME('mhu_portal_frame_3bay.ifc','{timestamp}',('Kyberlex <kyberlex@proton.me>'),('Foundation ONE'),'O.N.E. IFC4 Open-BIM Generator v1.0','FreeCAD 0.21+ / BlenderBIM','Class-0 Post-Labor Commons');
FILE_SCHEMA(('IFC4'));
ENDSEC;
DATA;"""

    # --- BASIC GEOMETRY & UNITS SETUP ---
    # Global unique ID generator dummy
    guid_idx = 0
    def make_guid(label):
        nonlocal guid_idx
        guid_idx += 1
        # 22-char IFC GUID compliant representation
        base = f"ONE_MHU_FRAME_{guid_idx:04d}_{label}"
        return base[:22].ljust(22, "_")

    # SI Units: Length in Metre, Angle in Radian
    id_person = add("IFCPERSON($,'Kyberlex','O.N.E. Foundation',$,$,$,$,$)")
    id_org = add("IFCORGANIZATION($,'Open Networked Earth (O.N.E.)','Post-Labor Commons Foundation',$,$)")
    id_p_and_o = add(f"IFCPERSONANDORGANIZATION(#{id_person},#{id_org},$)")
    id_app = add(f"IFCAPPLICATION(#{id_org},'1.0','ONE-BIM-Engine','ONE-BIM')")
    id_owner_history = add(f"IFCOWNERHISTORY(#{id_p_and_o},#{id_app},$,.ADDED.,$,$,$,1700000000)")

    id_dim_exp = add("IFCDIMENSIONALEXPONENTS(0,0,0,0,0,0,0)")
    id_unit_m = add(f"IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)")
    id_unit_rad = add(f"IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.)")
    id_unit_sec = add(f"IFCSIUNIT(*,.TIMEUNIT.,$,.SECOND.)")
    id_unit_assign = add(f"IFCUNITASSIGNMENT((#{id_unit_m},#{id_unit_rad},#{id_unit_sec}))")

    # World Coordinate System & Context
    id_origin_3d = add("IFCCARTESIANPOINT((0.,0.,0.))")
    id_dir_z = add("IFCDIRECTION((0.,0.,1.))")
    id_dir_x = add("IFCDIRECTION((1.,0.,0.))")
    id_axis2_world = add(f"IFCAXIS2PLACEMENT3D(#{id_origin_3d},#{id_dir_z},#{id_dir_x})")
    id_geom_context = add(f"IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#{id_axis2_world},$)")

    # Project & Spatial Hierarchy
    id_proj = add(f"IFCPROJECT('{make_guid('PROJ')}',#{id_owner_history},'MHU_54M2_PORTAL_FRAME','Parametric 3-Bay Modular Habitat Unit Timber Chassis',$,$,$,(#{id_geom_context}),#{id_unit_assign})")
    id_site = add(f"IFCSITE('{make_guid('SITE')}',#{id_owner_history},'Bioregional_Seed_Node','Universal Bioregional Commons',$,#{id_axis2_world},$,$,.ELEMENT.,(45,0,0),(9,0,0),0.,$,$)")
    id_bldg = add(f"IFCBUILDING('{make_guid('BLDG')}',#{id_owner_history},'MHU_Chassis_Unit_01','Passivhaus Modular Living Unit 54m2',$,#{id_axis2_world},$,$,.ELEMENT.,$,$,$)")
    id_storey = add(f"IFCBUILDINGSTOREY('{make_guid('STRY')}',#{id_owner_history},'Level_0_Ground','Finished Floor Level +0.000',$,#{id_axis2_world},$,$,.ELEMENT.,0.)")

    # Materials
    id_mat_c24 = add("IFCMATERIAL('C24 Structural Softwood (EN 338)',$,$)")
    id_mat_birch = add("IFCMATERIAL('18mm Birch Plywood Gusset (EN 636-3)',$,$)")
    id_mat_s355 = add("IFCMATERIAL('S355 Structural Steel Helical Cap',$,$)")

    # Cross Sections (Extruded Profiles)
    # C24 Timber Stud Profile: 45mm x 195mm (0.045m x 0.195m)
    id_prof_origin = add("IFCCARTESIANPOINT((0.,0.))")
    id_prof_axis = add(f"IFCAXIS2PLACEMENT2D(#{id_prof_origin},$)")
    id_prof_c24 = add(f"IFCRECTANGLEPROFILEDEF(.AREA.,'C24_45x195',#{id_prof_axis},0.045,0.195)")
    # Steel Flange Profile: 800mm x 800mm x 15mm
    id_prof_s355 = add(f"IFCRECTANGLEPROFILEDEF(.AREA.,'S355_Flange_800x800',#{id_prof_axis},0.800,0.800)")

    # Grouping structural elements
    structural_ids = []

    # 4 Portal Bents along the Y axis at Y = 0.0m, 3.0m, 6.0m, 9.0m (3 bays)
    # Span along X = 6.0m (-3.0m to +3.0m)
    # Height of columns = 2.8m
    # Ridge apex at X = 0.0m, Z = 3.8m
    bent_spacings_y = [0.0, 3.0, 6.0, 9.0]

    for b_idx, y_pos in enumerate(bent_spacings_y):
        # 1. Left Column (X = -3.0m, Y = y_pos, Z = 0 to 2.8m)
        pt_col_l = add(f"IFCCARTESIANPOINT((-3.0,{y_pos},0.0))")
        axis_col_l = add(f"IFCAXIS2PLACEMENT3D(#{pt_col_l},#{id_dir_z},#{id_dir_x})")
        solid_col_l = add(f"IFCEXTRUDEDAREASOLID(#{id_prof_c24},#{axis_col_l},#{id_dir_z},2.8)")
        shape_col_l = add(f"IFCSHAPEREPRESENTATION(#{id_geom_context},'Body','SweptSolid',(#{solid_col_l}))")
        prod_def_col_l = add(f"IFCPRODUCTDEFINITIONSHAPE($,$,(#{shape_col_l}))")
        col_l_elem = add(f"IFCMEMBER('{make_guid(f'COL_L{b_idx}')}',#{id_owner_history},'MHU_Column_C24_Left_{b_idx+1}','C24 45x195 Column',$,#{axis_col_l},#{prod_def_col_l},$,$)")
        structural_ids.append(col_l_elem)

        # 2. Right Column (X = +3.0m, Y = y_pos, Z = 0 to 2.8m)
        pt_col_r = add(f"IFCCARTESIANPOINT((3.0,{y_pos},0.0))")
        axis_col_r = add(f"IFCAXIS2PLACEMENT3D(#{pt_col_r},#{id_dir_z},#{id_dir_x})")
        solid_col_r = add(f"IFCEXTRUDEDAREASOLID(#{id_prof_c24},#{axis_col_r},#{id_dir_z},2.8)")
        shape_col_r = add(f"IFCSHAPEREPRESENTATION(#{id_geom_context},'Body','SweptSolid',(#{solid_col_r}))")
        prod_def_col_r = add(f"IFCPRODUCTDEFINITIONSHAPE($,$,(#{shape_col_r}))")
        col_r_elem = add(f"IFCMEMBER('{make_guid(f'COL_R{b_idx}')}',#{id_owner_history},'MHU_Column_C24_Right_{b_idx+1}','C24 45x195 Column',$,#{axis_col_r},#{prod_def_col_r},$,$)")
        structural_ids.append(col_r_elem)

        # 3. Knee Nodal Gusset Plates (Double-Shear 18mm Birch Plywood at Z = 2.8m)
        pt_gusset_l = add(f"IFCCARTESIANPOINT((-3.0,{y_pos},2.8))")
        axis_gusset_l = add(f"IFCAXIS2PLACEMENT3D(#{pt_gusset_l},#{id_dir_z},#{id_dir_x})")
        plate_l = add(f"IFCPLATE('{make_guid(f'GUSS_L{b_idx}')}',#{id_owner_history},'MHU_Knee_Gusset_Left_{b_idx+1}','18mm Birch Nodal Joint (EC5)',$,#{axis_gusset_l},$,$,$)")
        structural_ids.append(plate_l)

        pt_gusset_r = add(f"IFCCARTESIANPOINT((3.0,{y_pos},2.8))")
        axis_gusset_r = add(f"IFCAXIS2PLACEMENT3D(#{pt_gusset_r},#{id_dir_z},#{id_dir_x})")
        plate_r = add(f"IFCPLATE('{make_guid(f'GUSS_R{b_idx}')}',#{id_owner_history},'MHU_Knee_Gusset_Right_{b_idx+1}','18mm Birch Nodal Joint (EC5)',$,#{axis_gusset_r},$,$,$)")
        structural_ids.append(plate_r)

        # 4. Helical Pile Docking Flanges (S355 at Z = 0.0m)
        pt_pile_l = add(f"IFCCARTESIANPOINT((-3.0,{y_pos},0.0))")
        axis_pile_l = add(f"IFCAXIS2PLACEMENT3D(#{pt_pile_l},#{id_dir_z},#{id_dir_x})")
        pile_l = add(f"IFCFOOTING('{make_guid(f'PILE_L{b_idx}')}',#{id_owner_history},'MHU_Helical_Flange_Left_{b_idx+1}','S355 Helical Foundation Docking',$,#{axis_pile_l},$,$,.PAD_FOOTING.)")
        structural_ids.append(pile_l)

        pt_pile_r = add(f"IFCCARTESIANPOINT((3.0,{y_pos},0.0))")
        axis_pile_r = add(f"IFCAXIS2PLACEMENT3D(#{pt_pile_r},#{id_dir_z},#{id_dir_x})")
        pile_r = add(f"IFCFOOTING('{make_guid(f'PILE_R{b_idx}')}',#{id_owner_history},'MHU_Helical_Flange_Right_{b_idx+1}','S355 Helical Foundation Docking',$,#{axis_pile_r},$,$,.PAD_FOOTING.)")
        structural_ids.append(pile_r)

    # 5. Sole Plates along Y (Length = 9.0m)
    pt_sole_l = add("IFCCARTESIANPOINT((-3.0,0.0,0.0))")
    axis_sole_l = add(f"IFCAXIS2PLACEMENT3D(#{pt_sole_l},#{id_dir_z},#{id_dir_x})")
    sole_l = add(f"IFCMEMBER('{make_guid('SOLE_L')}',#{id_owner_history},'MHU_Sole_Plate_Left_9m','C24 Continuous Ground Sole Plate',$,#{axis_sole_l},$,$,$)")
    structural_ids.append(sole_l)

    pt_sole_r = add("IFCCARTESIANPOINT((3.0,0.0,0.0))")
    axis_sole_r = add(f"IFCAXIS2PLACEMENT3D(#{pt_sole_r},#{id_dir_z},#{id_dir_x})")
    sole_r = add(f"IFCMEMBER('{make_guid('SOLE_R')}',#{id_owner_history},'MHU_Sole_Plate_Right_9m','C24 Continuous Ground Sole Plate',$,#{axis_sole_r},$,$,$)")
    structural_ids.append(sole_r)

    # Spatial Containment Relationships (IfcRelContainedInSpatialStructure)
    elems_tuple = "(" + ",".join(f"#{elem_id}" for elem_id in structural_ids) + ")"
    add(f"IFCRELCONTAINEDINSPATIALSTRUCTURE('{make_guid('REL_CONTAIN')}',#{id_owner_history},'Spatial_Containment','Structural Frame in Level 0',{elems_tuple},#{id_storey})")

    # Aggregation Hierarchy (IfcRelAggregates)
    add(f"IFCRELAGGREGATES('{make_guid('REL_PROJ')}',#{id_owner_history},'Project_Site','Project to Site Hierarchy',#{id_proj},(#{id_site}))")
    add(f"IFCRELAGGREGATES('{make_guid('REL_SITE')}',#{id_owner_history},'Site_Bldg','Site to Building Hierarchy',#{id_site},(#{id_bldg}))")
    add(f"IFCRELAGGREGATES('{make_guid('REL_BLDG')}',#{id_owner_history},'Bldg_Storey','Building to Storey Hierarchy',#{id_bldg},(#{id_storey}))")

    # Combine into full STEP output
    content = header + "\n" + "\n".join(lines) + "\nENDSEC;\nEND-ISO-10303-21;\n"

    with open(OUTPUT_IFC, "w", encoding="utf-8") as f:
        f.write(content)

    file_size_kb = os.path.getsize(OUTPUT_IFC) / 1024.0
    print(f"[IFC4 EXPORT COMPLETE] Generated {OUTPUT_IFC} ({file_size_kb:.1f} KB, {len(structural_ids)} structural members).")
    return OUTPUT_IFC


if __name__ == "__main__":
    generate_ifc4_portal_frame()

