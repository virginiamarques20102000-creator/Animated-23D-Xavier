# Teste Blender (bpy 5.x, Cycles CPU): personagem riggado anda numa rua em ruínas, para, mira e dispara 2 vezes
# (recuo com mola, clarão, luz, fumaça, cápsula balística que quica). Uso: python hitler_walk_shoot.py out_dir [frames]
import bpy, math, sys, random
from mathutils import Vector, Euler

OUT = sys.argv[-2] if len(sys.argv) > 2 else "/tmp/bl"
FR = sys.argv[-1] if len(sys.argv) > 2 else "1-120"
random.seed(4)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 24; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = 1280, 720; sc.render.fps = 24; sc.frame_start, sc.frame_end = 1, 120
sc.view_settings.view_transform = "AgX"
for lk in ("AgX - Medium High Contrast", "AgX - Punchy", "Punchy"):
    try: sc.view_settings.look = lk; break
    except Exception: pass
sc.view_settings.exposure = -0.35
sc.render.film_transparent = False

def mat(name, col, rough=0.6, metal=0.0, sss=0.0, emit=None, noise=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if sss: b.inputs["Subsurface Weight"].default_value = sss; b.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.2)
    if emit: b.inputs["Emission Color"].default_value = (*emit[0], 1); b.inputs["Emission Strength"].default_value = emit[1]
    if noise:  # grime / fabric variation
        tx = nt.nodes.new("ShaderNodeTexNoise"); tx.inputs["Scale"].default_value = 60; tx.inputs["Detail"].default_value = 8
        mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.inputs["Factor"].default_value = noise
        mx.inputs[6].default_value = (*col, 1); mx.inputs[7].default_value = (col[0] * 0.55, col[1] * 0.55, col[2] * 0.55, 1)
        nt.links.new(tx.outputs["Fac"], mx.inputs["Factor"]); nt.links.new(mx.outputs[2], b.inputs["Base Color"])
        bm = nt.nodes.new("ShaderNodeBump"); bm.inputs["Strength"].default_value = 0.25; nt.links.new(tx.outputs["Fac"], bm.inputs["Height"]); nt.links.new(bm.outputs["Normal"], b.inputs["Normal"])
    return m
def srgb(h): h = h.lstrip("#"); return tuple(((int(h[i:i + 2], 16) / 255) ** 2.2) for i in (0, 2, 4))

M_JACKET = mat("jacket", srgb("#6c6e62"), 0.85, noise=0.35); M_PANTS = mat("pants", srgb("#3c3d3a"), 0.85, noise=0.3); M_BOOT = mat("boot", srgb("#121010"), 0.25, noise=0.15)
M_SKIN = mat("skin", srgb("#e8b89a"), 0.45, sss=0.15); M_HAIR = mat("hair", srgb("#1a1410"), 0.5); M_BELT = mat("belt", srgb("#2a1e16"), 0.35)
M_CAP = mat("cap", srgb("#5e6058"), 0.7, noise=0.2); M_VISOR = mat("visor", srgb("#0a0a0a"), 0.15); M_GOLD = mat("gold", srgb("#c9a24a"), 0.3, 0.9)
M_GUN = mat("gun", srgb("#1a1a1c"), 0.3, 0.85); M_EYE = mat("eye", srgb("#f2efe8"), 0.2); M_IRIS = mat("iris", srgb("#2a4a6a"), 0.1)
M_FLASH = mat("flash", (1, 0.6, 0.2), emit=((1, 0.55, 0.15), 25)); M_BRASS = mat("brass", srgb("#c8962e"), 0.25, 1.0)

# ---------------- body: skin-modifier skeleton → organic mesh ----------------
J = {"pelvis": (0, 0, 0.98), "waist": (0, 0, 1.12), "chest": (0, 0, 1.34), "neck": (0, 0, 1.5), "neckT": (0, 0, 1.56)}
for s, sx in (("L", 1), ("R", -1)):
    J.update({f"hip{s}": (0.1 * sx, 0, 0.93), f"knee{s}": (0.1 * sx, -0.02, 0.52), f"ankle{s}": (0.1 * sx, 0.02, 0.09), f"toe{s}": (0.1 * sx, -0.16, 0.04),
              f"sho{s}": (0.21 * sx, 0, 1.44), f"elb{s}": (0.25 * sx, 0.03, 1.15), f"wri{s}": (0.27 * sx, 0.0, 0.9), f"hand{s}": (0.28 * sx, -0.01, 0.8)})
names = list(J); idx = {n: i for i, n in enumerate(names)}
E = [("pelvis", "waist"), ("waist", "chest"), ("chest", "neck"), ("neck", "neckT")]
for s in "LR": E += [("pelvis", f"hip{s}"), (f"hip{s}", f"knee{s}"), (f"knee{s}", f"ankle{s}"), (f"ankle{s}", f"toe{s}"), ("chest", f"sho{s}"), (f"sho{s}", f"elb{s}"), (f"elb{s}", f"wri{s}"), (f"wri{s}", f"hand{s}")]
me = bpy.data.meshes.new("body"); me.from_pydata([J[n] for n in names], [(idx[a], idx[b]) for a, b in E], []); body = bpy.data.objects.new("body", me); sc.collection.objects.link(body)
sk = body.modifiers.new("skin", "SKIN"); RAD = {"pelvis": (0.165, 0.12), "waist": (0.15, 0.11), "chest": (0.185, 0.12), "neck": (0.06, 0.06), "neckT": (0.055, 0.055)}
for s in "LR": RAD.update({f"hip{s}": (0.09, 0.095), f"knee{s}": (0.062, 0.065), f"ankle{s}": (0.05, 0.06), f"toe{s}": (0.045, 0.04), f"sho{s}": (0.065, 0.065), f"elb{s}": (0.048, 0.048), f"wri{s}": (0.034, 0.03), f"hand{s}": (0.045, 0.022)})
for i, n in enumerate(names): body.data.skin_vertices[0].data[i].radius = RAD[n]
body.data.skin_vertices[0].data[idx["pelvis"]].use_root = True
sub = body.modifiers.new("sub", "SUBSURF"); sub.levels = 2
bpy.context.view_layer.objects.active = body; body.select_set(True)
bpy.ops.object.modifier_apply(modifier="skin"); bpy.ops.object.modifier_apply(modifier="sub"); bpy.ops.object.shade_smooth()
for m in (M_JACKET, M_PANTS, M_BOOT, M_SKIN, M_BELT): body.data.materials.append(m)
for p in body.data.polygons:
    c = p.center; mi = 0
    if c.z < 0.17: mi = 2
    elif abs(c.x) > 0.22 and c.z < 0.9: mi = 3
    elif abs(c.x) > 0.17 and c.z > 1.03: mi = 0
    elif c.z < 0.97: mi = 1
    elif c.z < 1.03: mi = 4
    p.material_index = mi
# jacket skirt flare + buttons + collar
def add(obj, m=None, parent=None):
    if m: obj.data.materials.append(m)
    return obj
def prim(kind, loc, scale, m, rot=(0, 0, 0), name="p", smooth=True, **kw):
    getattr(bpy.ops.mesh, f"primitive_{kind}_add")(location=loc, rotation=rot, **kw); o = bpy.context.object; o.name = name; o.scale = scale
    o.data.materials.append(m)
    if smooth: bpy.ops.object.shade_smooth()
    return o
parts = []
for z in (1.08, 1.18, 1.28, 1.38): parts.append(("waist", prim("uv_sphere", (0, -0.112, z), (0.012, 0.006, 0.012), M_GOLD, name="btn", segments=12, ring_count=8)))
parts.append(("neck", prim("cylinder", (0, 0, 1.5), (0.075, 0.07, 0.03), M_JACKET, name="collar")))
# ---------------- head ----------------
H = (0, -0.01, 1.68)
head = prim("uv_sphere", H, (0.092, 0.102, 0.122), M_SKIN, name="head", segments=48, ring_count=32)
parts += [("neckT", head)]
parts.append(("neckT", prim("uv_sphere", (0, -0.104, 1.665), (0.02, 0.03, 0.034), M_SKIN, name="nose", segments=16, ring_count=12)))
for sx in (1, -1):
    parts.append(("neckT", prim("uv_sphere", (0.093 * sx, 0, 1.675), (0.01, 0.022, 0.032), M_SKIN, name="ear", segments=16, ring_count=10)))
    parts.append(("neckT", prim("uv_sphere", (0.035 * sx, -0.084, 1.7), (0.018, 0.012, 0.012), M_EYE, name="eye", segments=16, ring_count=10)))
    parts.append(("neckT", prim("uv_sphere", (0.035 * sx, -0.094, 1.7), (0.007, 0.004, 0.007), M_IRIS, name="iris", segments=12, ring_count=8)))
    parts.append(("neckT", prim("cube", (0.036 * sx, -0.093, 1.725), (0.021, 0.006, 0.005), M_HAIR, name="brow", rot=(0, -0.12 * sx, 0), smooth=False)))
parts.append(("neckT", prim("cube", (0, -0.104, 1.632), (0.016, 0.01, 0.011), M_HAIR, name="moustache", smooth=False)))
parts.append(("neckT", prim("cube", (0, -0.098, 1.606), (0.028, 0.006, 0.004), mat("lip", srgb("#a8665a"), 0.4), name="mouth", smooth=False)))
parts.append(("neckT", prim("uv_sphere", (0, 0.012, 1.722), (0.096, 0.1, 0.09), M_HAIR, name="hair", segments=32, ring_count=16)))
cap = prim("cylinder", (0, -0.005, 1.8), (0.112, 0.118, 0.045), M_CAP, name="cap", vertices=48); parts.append(("neckT", cap))
parts.append(("neckT", prim("cylinder", (0, -0.005, 1.765), (0.1, 0.106, 0.02), mat("band", srgb("#2a2a26"), 0.6), name="capband", vertices=48)))
parts.append(("neckT", prim("cylinder", (0, -0.1, 1.758), (0.085, 0.06, 0.006), M_VISOR, name="visor", rot=(0.25, 0, 0), vertices=32)))
parts.append(("neckT", prim("uv_sphere", (0, -0.12, 1.79), (0.02, 0.006, 0.012), M_GOLD, name="badge", segments=12, ring_count=8)))
# ---------------- pistol (built in rest pose along the right forearm: barrel −Z, grip +Y) ----------------
gun = prim("cube", (-0.28, -0.0, 0.74), (0.012, 0.018, 0.085), M_GUN, name="slide", smooth=False)
grip = prim("cube", (-0.28, 0.03, 0.80), (0.011, 0.03, 0.018), M_GUN, name="grip", rot=(0.25, 0, 0), smooth=False)
muz = prim("uv_sphere", (-0.28, 0.0, 0.64), (0.04, 0.04, 0.09), M_FLASH, name="flash", segments=16, ring_count=8); muz.hide_render = True
for o in (gun, grip, muz): parts.append(("handR", o))
# ---------------- armature ----------------
arm = bpy.data.armatures.new("rig"); rig = bpy.data.objects.new("rig", arm); sc.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode="EDIT")
B = {}
def bone(n, a, b, par=None):
    e = arm.edit_bones.new(n); e.head = J[a] if isinstance(a, str) else a; e.tail = J[b] if isinstance(b, str) else b
    if par: e.parent = B[par]; e.use_connect = False
    B[n] = e; return e
bone("root", (0, 0, 0), (0, 0, 0.3)); bone("pelvis", "pelvis", "waist", "root"); bone("spine", "waist", "chest", "pelvis"); bone("chest", "chest", "neck", "spine"); bone("neckT", "neck", (0, 0, 1.8), "chest")
for s in "LR":
    bone(f"thigh{s}", f"hip{s}", f"knee{s}", "pelvis"); bone(f"shin{s}", f"knee{s}", f"ankle{s}", f"thigh{s}"); bone(f"foot{s}", f"ankle{s}", f"toe{s}", f"shin{s}")
    bone(f"upper{s}", f"sho{s}", f"elb{s}", "chest"); bone(f"fore{s}", f"elb{s}", f"wri{s}", f"upper{s}"); bone(f"hand{s}", f"wri{s}", f"hand{s}", f"fore{s}")
for e in arm.edit_bones: e.roll = 0
bpy.ops.object.mode_set(mode="OBJECT")
bpy.ops.object.select_all(action="DESELECT"); body.select_set(True); rig.select_set(True); bpy.context.view_layer.objects.active = rig
bpy.ops.object.parent_set(type="ARMATURE_AUTO")
for bn, o in parts:
    mw = o.matrix_world.copy(); o.parent = rig; o.parent_type = "BONE"; o.parent_bone = bn; o.matrix_world = mw
rig.rotation_euler = (0, 0, math.radians(90))  # face +X (walking direction)

# ---------------- animation ----------------
pb = rig.pose.bones
for p in pb: p.rotation_mode = "XYZ"
def key(f, name, rx=0.0, ry=0.0, rz=0.0):
    p = pb[name]; p.rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz)); p.keyframe_insert("rotation_euler", frame=f)
WALK_END, STRIDE, CYC = 66, 0.72, 24  # 1 step = 12 frames, 1.44 m per cycle => 1.44 m/s
for f in range(1, 121):
    if f <= WALK_END:
        ph = (f - 1) / CYC * 2 * math.pi; s = math.sin(ph); c = math.cos(ph)
        key(f, "thighL", -26 * s); key(f, "thighR", 26 * s)
        key(f, "shinL", 4 + 32 * max(0, math.sin(ph + 1.2))); key(f, "shinR", 4 + 32 * max(0, math.sin(ph + 1.2 + math.pi)))
        key(f, "footL", 10 * math.sin(ph + 0.5)); key(f, "footR", 10 * math.sin(ph + 0.5 + math.pi))
        key(f, "upperL", 20 * s, 0, 4); key(f, "upperR", -20 * s, 0, -4); key(f, "foreL", -12 - 8 * max(0, s)); key(f, "foreR", -12 - 8 * max(0, -s))
        key(f, "pelvis", 0, 0, 5 * s); key(f, "chest", -3, 0, -7 * s); key(f, "neckT", 2, 0, 3 * s)
        pb["root"].location = (0, 0.025 * abs(c) - 0.02, 0); pb["root"].keyframe_insert("location", frame=f)
    else:
        k = min(1, (f - WALK_END) / 10); e = k * k * (3 - 2 * k)
        for n in ("thighL", "thighR", "shinL", "shinR", "footL", "footR", "pelvis", "upperL", "foreL"): key(f, n, 0 if n not in ("upperL", "foreL") else (0 if n == "upperL" else -10))
        key(f, "chest", -3 * (1 - e) + 2 * e, 0, 0); pb["root"].location = (0, 0, 0); pb["root"].keyframe_insert("location", frame=f)
        aim = min(1, max(0, (f - 74) / 10)); aim = aim * aim * (3 - 2 * aim)
        rec = 0.0
        for fs in (92, 104):
            t = (f - fs) / 24
            if t >= 0: rec += 22 * math.exp(-t * 9) * math.cos(t * 28)  # recoil kick, damped spring back
        key(f, "upperR", -88 * aim - rec * 0.4, 0, -6 * aim); key(f, "foreR", -4 * aim - rec * 0.6 - 12 * (1 - aim)); key(f, "handR", 0 - rec * 0.3)
        key(f, "neckT", 4 * aim, 0, -4 * aim); key(f, "spine", 0, 0, -6 * aim)
# root motion: travel along the walking direction (local −Y of the rig = world +X)
for f in range(1, 121):
    x = -2.6 + min(f - 1, WALK_END - 1) * (1.44 / 24) + (0.12 if f > WALK_END else 0) * min(1, (f - WALK_END) / 10)
    rig.location = (x, 0, 0); rig.keyframe_insert("location", frame=f)
# muzzle flash + light
fl = bpy.data.lights.new("muzzle", "POINT"); fl.color = (1, 0.7, 0.35); flo = bpy.data.objects.new("muzzleL", fl); sc.collection.objects.link(flo)
flo.parent = muz; flo.location = (0, 0, 0)
for f in range(1, 121):
    on = f in (92, 93, 104, 105); muz.hide_render = not on; muz.keyframe_insert("hide_render", frame=f)
    fl.energy = (900 if f in (92, 104) else 300) if on else 0; fl.keyframe_insert("energy", frame=f)
    muz.scale = (0.03 * (1.3 if f in (92, 104) else 0.7), 0.03 * (1.3 if f in (92, 104) else 0.7), 0.07 * (1.4 if f in (92, 104) else 0.8)); muz.keyframe_insert("scale", frame=f)

# ---------------- environment: ruined street, rubble, haze ----------------
M_GROUND = mat("ground", srgb("#3e3a36"), 0.95, noise=0.7); M_WALL = mat("wall", srgb("#5e5650"), 0.92, noise=0.6); M_BRICK = mat("brick", srgb("#5a3428"), 0.9, noise=0.5)
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0)); g = bpy.context.object; g.data.materials.append(M_GROUND)
M_HOLE = mat("hole", (0.004, 0.004, 0.004), 1.0)
for i in range(14):
    bpy.ops.mesh.primitive_cube_add(location=(-30 + i * 4.6 + random.uniform(-1, 1), 22 + random.uniform(0, 6), 0)); bk = bpy.context.object; hh = random.uniform(6, 18); bk.scale = (random.uniform(1.4, 2.4), 1, hh); bk.data.materials.append(mat("far%d" % i, srgb("#4a4448"), 0.95))
for i in range(9):
    x = -10 + i * 3.2 + random.uniform(-0.5, 0.5); h = random.uniform(3, 9)
    bpy.ops.mesh.primitive_cube_add(location=(x, 6 + random.uniform(-0.3, 0.6), h / 2), rotation=(0, random.uniform(-0.05, 0.05), random.uniform(-0.1, 0.1))); w = bpy.context.object
    w.scale = (random.uniform(1.0, 1.6), 0.25, h / 2); w.data.materials.append(M_WALL if i % 3 else M_BRICK); bv = w.modifiers.new("b", "BEVEL"); bv.width = 0.05
    for k in range(3):
        bpy.ops.mesh.primitive_cube_add(location=(x + random.uniform(-0.8, 0.8), 5.74, random.uniform(1.2, max(1.3, h - 0.8))), scale=(0.28, 0.02, 0.42)); bpy.context.object.data.materials.append(M_HOLE)
for i in range(120):
    bpy.ops.mesh.primitive_cube_add(location=(random.uniform(-9, 9), random.uniform(-3, 5.5), 0.05), rotation=(random.random() * 3, random.random() * 3, random.random() * 3)); r = bpy.context.object
    s = random.uniform(0.03, 0.14); r.scale = (s, s * random.uniform(0.6, 1.4), s * 0.6); r.data.materials.append(M_BRICK if i % 2 else M_WALL)
# brass casings: ejected right/up at each shot, ballistic with bounce on the street (physics computed per frame)
for k, fs in enumerate((92, 104)):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.0055, depth=0.02, location=(0, 0, -5)); cs = bpy.context.object; cs.data.materials.append(M_BRASS)
    for f in range(1, 121):
        t = (f - fs) / 24
        if t < 0: cs.location = (0, 0, -5)
        else:
            vx, vy, vz, z0, e, gz = 0.6, 1.4, 2.2, 1.45, 0.35, 9.81; z = z0; v = vz; tt = t; zz = z0
            while True:
                th = (v + math.sqrt(v * v + 2 * gz * z)) / gz
                if tt < th: zz = z + v * tt - 0.5 * gz * tt * tt; break
                tt -= th; v = math.sqrt(v * v + 2 * gz * z) * e; z = 0.01
                if v < 0.3: zz = 0.01; break
            base_x = rig.animation_data.action.fcurves.find("location", index=0) if False else None
            cs.location = (-2.6 + (WALK_END - 1) * 1.44 / 24 + 0.12 + 0.12 + vx * min(t, 0.9), 0.15 + vy * min(t, 0.8) * 0.4, zz)
            cs.rotation_euler = (t * 25, t * 13, 0)
        cs.keyframe_insert("location", frame=f); cs.keyframe_insert("rotation_euler", frame=f)
# smoke puff at the muzzle after each shot (expanding, fading grey volume-free spheres)
M_SMOKE = mat("smoke", (0.6, 0.6, 0.62), 1.0); M_SMOKE.node_tree.nodes["Principled BSDF"].inputs["Alpha"].default_value = 0.35; M_SMOKE.blend_method = "BLEND" if hasattr(M_SMOKE, "blend_method") else None
# ---------------- light, sky, camera ----------------
world = bpy.data.worlds.new("w"); sc.world = world; world.use_nodes = True; bg = world.node_tree.nodes["Background"]
try:
    sky = world.node_tree.nodes.new("ShaderNodeTexSky"); sky.sun_elevation = math.radians(12); sky.sun_rotation = math.radians(200); world.node_tree.links.new(sky.outputs[0], bg.inputs[0]); bg.inputs[1].default_value = 0.22
except Exception: bg.inputs[0].default_value = (0.5, 0.45, 0.4, 1)
sun = bpy.data.lights.new("sun", "SUN"); sun.energy = 4.0; sun.color = (1, 0.82, 0.62); sun.angle = math.radians(2); so = bpy.data.objects.new("sun", sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(68), 0, math.radians(-140))
fill = bpy.data.lights.new("fill", "AREA"); fill.energy = 120; fill.size = 6; fill.color = (0.6, 0.7, 1.0); fo = bpy.data.objects.new("fill", fill); sc.collection.objects.link(fo); fo.location = (0, -6, 4); fo.rotation_euler = (math.radians(55), 0, 0)
cd = bpy.data.cameras.new("cam"); cd.lens = 45; cd.dof.use_dof = True; cd.dof.aperture_fstop = 2.8; cam = bpy.data.objects.new("cam", cd); sc.collection.objects.link(cam); sc.camera = cam
tgt = bpy.data.objects.new("tgt", None); sc.collection.objects.link(tgt); tc = cam.constraints.new("TRACK_TO"); tc.target = tgt; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"; cd.dof.focus_object = tgt
for f in range(1, 121):
    k = (f - 1) / 119; x = -2.6 + min(f - 1, WALK_END - 1) * 1.44 / 24
    cam.location = (x - 0.8 + 1.6 * k, -4.6 + 1.2 * k, 1.35 + 0.15 * math.sin(k * 3)); tgt.location = (x + 0.3, 0, 1.25)
    if f >= 92: cam.location = (cam.location.x + 0.02 * math.exp(-(f - 92) / 3) * (-1) ** f, cam.location.y, cam.location.z)
    cam.keyframe_insert("location", frame=f); tgt.keyframe_insert("location", frame=f)
sc.render.image_settings.file_format = "PNG"; sc.render.filepath = OUT + "/f_"
a, b = (int(v) for v in FR.split("-")); sc.frame_start, sc.frame_end = a, b
bpy.ops.render.render(animation=True)
print("DONE", a, b)
