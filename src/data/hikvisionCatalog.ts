import type { ParsedMaterial } from '@/lib/parseMaterialsPdf';

// Catalogue Hikvision / ALLNTIC — extrait du TECH_LIST officiel
// Prix en FCFA. Peuvent être révisés à l'import.
export const HIKVISION_CATALOG: ParsedMaterial[] = [
  // ===== Écrans interactifs =====
  { nom: '75-inch 4K Interactive Display', reference: 'DS-D5C75RB_B', categorie: 'autre', prixUnitaire: 1500000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Écran interactif 4K 75" UHD 3840×2160, anti-reflet, double OS Android/Windows, tactile 50 points, EDLA.' },
  { nom: '86-inch 4K Interactive Display', reference: 'DS-D5C86RB_B', categorie: 'autre', prixUnitaire: 1950000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Écran interactif 4K 86" UHD 3840×2160, anti-reflet, double OS Android/Windows, tactile 50 points, EDLA.' },
  { nom: 'Wireless Dongle', reference: 'DS-D5SC3B-B', categorie: 'accessoire', prixUnitaire: 70000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Dongle sans fil Type-C, Windows/Mac, Wi-Fi 2.4/5G, 4K, NFC.' },
  { nom: '75" Conference Flat Panel Brackets', reference: 'DS-D5ABKY2-S', categorie: 'accessoire', prixUnitaire: 90000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Support mural pour écran 55/65/75".' },
  { nom: '86" Conference Flat Panel Brackets', reference: 'DS-D5ABKY2-B', categorie: 'accessoire', prixUnitaire: 130000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Support mural pour écran 86".' },

  // ===== Contrôle d'accès =====
  { nom: 'Face Recognition Terminal', reference: 'DS-K1T670MWX-QR', categorie: 'accessoire', prixUnitaire: 175000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Terminal reconnaissance faciale 7", M1, masque, 6000 visages, 50 000 cartes.' },
  { nom: 'Pro Face Access Terminal', reference: 'DS-K1T673DWX', categorie: 'accessoire', prixUnitaire: 195000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Pro Face Terminal 7", M1/Felica/DESfire, 10 000 visages/empreintes, 50 000 cartes.' },
  { nom: 'Metal Vandal-resistant Facial Recognition IP Villa Door Station', reference: 'DS-KV9503-WBE1', categorie: 'accessoire', prixUnitaire: 110000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Portier IP villa métal anti-vandale, LCD 4.3", 2×2 MP IR, PoE, IK08/IP65, face/PIN/carte/QR/BLE.' },
  { nom: 'Face Recognition Terminal Kit', reference: 'DS-KAS321', categorie: 'accessoire', prixUnitaire: 55000, unite: 'KIT', stockQuantite: 0, stockMinimum: 2, description: 'Kit DS-K1T321MFWX 2.4" LCD, face/empreinte/carte/PIN, 500 visages, 3000 cartes/empreintes.' },
  { nom: 'Pro Series Magnetic Lock', reference: 'DS-K4H450', categorie: 'accessoire', prixUnitaire: 50000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Ventouse électromagnétique 500kg, 12/24VDC.' },
  { nom: 'Pro Series Magnetic Lock Bracket', reference: 'DS-K4H450-LZ', categorie: 'accessoire', prixUnitaire: 30000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Support LZ pour ventouse Pro Series.' },
  { nom: 'Value Magnetic Locks Bracket', reference: 'DS-K4H255-U', categorie: 'accessoire', prixUnitaire: 3000, unite: 'PCS', stockQuantite: 0, stockMinimum: 5, description: 'Support U pour DS-K4H255S, porte vitrée sans cadre.' },
  { nom: 'Pro Series Electric Motor Lock', reference: 'DS-K4E100', categorie: 'accessoire', prixUnitaire: 19000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Serrure motorisée intelligente universelle, 12VDC.' },
  { nom: 'Electric Strike Lock', reference: 'DS-K4G100', categorie: 'accessoire', prixUnitaire: 25000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Gâche électrique fail-secure/safe, inox US304, 800kg, 100k cycles.' },
  { nom: 'Bolt Electric Lock', reference: 'DS-K4T108', categorie: 'accessoire', prixUnitaire: 15000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Serrure à pêne électrique 205×34×42mm, 12VDC.' },
  { nom: 'Face Access Terminal', reference: 'DS-K1T321MFX', categorie: 'accessoire', prixUnitaire: 45000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Terminal face + empreinte, LCD 2.4", 500 visages, 3000 cartes/empreintes.' },
  { nom: 'POE Face Recognition Terminal', reference: 'DS-K1T342MFWX-E1', categorie: 'accessoire', prixUnitaire: 82000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'POE Face+empreinte, LCD 4.3", 1500 visages, 3000 empreintes/cartes.' },
  { nom: 'Door Closer (60-85kg)', reference: 'DS-K4DC104', categorie: 'accessoire', prixUnitaire: 15000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Ferme-porte 60-85kg, largeur ≤1100mm, EN4.' },
  { nom: 'Door Closer (40-65kg)', reference: 'DS-K4DC103', categorie: 'accessoire', prixUnitaire: 13000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Ferme-porte 40-65kg, largeur ≤1100mm, EN4.' },
  { nom: 'Magnetic Lock Bracket LZ (K4H255)', reference: 'DS-K4H255D-LZ', categorie: 'accessoire', prixUnitaire: 8000, unite: 'PCS', stockQuantite: 0, stockMinimum: 5, description: 'Support LZ Value Series pour K4H255.' },
  { nom: 'Magnetic Lock Value 272kg', reference: 'DS-K4H255S', categorie: 'accessoire', prixUnitaire: 12000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Ventouse Value 272 kg, 12/24VDC, bois/verre/métal.' },
  { nom: 'Exit Button (No Touch)', reference: 'DS-K7P08', categorie: 'accessoire', prixUnitaire: 6000, unite: 'PCS', stockQuantite: 0, stockMinimum: 5, description: 'Bouton de sortie inox non tactile, 86×86×25.7mm.' },
  { nom: 'Emergency Break Glass (Green)', reference: 'DS-K7PEB/Green', categorie: 'accessoire', prixUnitaire: 8000, unite: 'PCS', stockQuantite: 0, stockMinimum: 5, description: 'Bouton urgence bris de glace vert.' },
  { nom: 'Emergency Break Glass (Red)', reference: 'DS-K7PEB', categorie: 'accessoire', prixUnitaire: 8000, unite: 'PCS', stockQuantite: 0, stockMinimum: 5, description: 'Bouton urgence bris de glace rouge.' },
  { nom: 'Access Controller 4 ports', reference: 'DS-K2604T', categorie: 'accessoire', prixUnitaire: 125000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Contrôleur d\'accès Pro 4 portes, interlocking, anti-passback.' },
  { nom: 'Access Controller 2 ports', reference: 'DS-K2602T', categorie: 'accessoire', prixUnitaire: 105000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Contrôleur d\'accès Pro 2 portes.' },
  { nom: 'Access Controller 1 port', reference: 'DS-K2601T', categorie: 'accessoire', prixUnitaire: 90000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Contrôleur d\'accès Pro 1 porte.' },
  { nom: 'Access Controller 2 Doors (IPv6)', reference: 'DS-K2622X', categorie: 'accessoire', prixUnitaire: 120000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Contrôleur Pro 2 portes IPv4/IPv6, DHCP, backup battery.' },
  { nom: 'Access Controller Pro X 4 doors', reference: 'DS-K2624X', categorie: 'accessoire', prixUnitaire: 150000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Contrôleur Pro AES256/RSA2048/TLS 1.2.' },
  { nom: 'Card Reader 1108AMK', reference: 'DS-K1108AMK', categorie: 'accessoire', prixUnitaire: 19000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Lecteur RS-485, Wiegand, OSDP, M1 13.56MHz, DESfire/Felica.' },
  { nom: 'Card Reader 1109DKB (BLE/QR)', reference: 'DS-K1109DKB', categorie: 'accessoire', prixUnitaire: 38000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Lecteur RS-485/Wiegand, DESfire/Felica/M1, carte/PIN/QR, Bluetooth.' },
  { nom: 'Card Reader 1107AM', reference: 'DS-K1107AM', categorie: 'accessoire', prixUnitaire: 15000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Lecteur 32-bit, RS-485/Wiegand/OSDP, Mifare 13.56MHz.' },
  { nom: 'Fingerprint Reader', reference: 'DS-K1201AMF', categorie: 'accessoire', prixUnitaire: 32000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Lecteur empreinte chiffré, RS-485 19200bps, M1, carte+empreinte.' },

  // ===== Intercom =====
  { nom: 'EM & Mifare Card (Dual Freq)', reference: 'S50+TK4100', categorie: 'accessoire', prixUnitaire: 500, unite: 'PCS', stockQuantite: 0, stockMinimum: 20, description: 'Carte Mifare1 + EM double fréquence.' },
  { nom: 'Mifare Card', reference: 'IC_S50', categorie: 'accessoire', prixUnitaire: 500, unite: 'PCS', stockQuantite: 0, stockMinimum: 20, description: 'Carte Mifare 1 sans contact 13.56 MHz.' },
  { nom: 'Villa Analog Intercom Kit', reference: 'DS-KIS203T', categorie: 'accessoire', prixUnitaire: 45000, unite: 'KIT', stockQuantite: 0, stockMinimum: 2, description: 'Kit interphone analogique 4 fils étanche, villa/maison.' },
  { nom: 'Hybrid Intercom Kit', reference: 'DS-KIS303p', categorie: 'accessoire', prixUnitaire: 58000, unite: 'KIT', stockQuantite: 0, stockMinimum: 2, description: 'Kit hybride 1 poste intérieur + 1 platine 4 fils, Hik-Connect.' },
  { nom: 'Hybrid HD Intercom Kit', reference: 'DS-KIS313-P', categorie: 'accessoire', prixUnitaire: 70000, unite: 'KIT', stockQuantite: 0, stockMinimum: 2, description: 'Kit HD TVI, écran tactile 7", Hik-Connect, Plug & Play.' },
  { nom: 'IP Intercom Villa Kit (Wi-Fi)', reference: 'DS-KIS603-P', categorie: 'accessoire', prixUnitaire: 90000, unite: 'KIT', stockQuantite: 0, stockMinimum: 2, description: 'Kit IP villa Wi-Fi.' },
  { nom: '4 Buttons Metal Villa Door Station', reference: 'DS-KV8413-WME1(C)', categorie: 'accessoire', prixUnitaire: 80000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Platine 4 boutons métal, cam 2MP IR, PoE, IK08/IP65.' },
  { nom: 'IP Indoor Station KH6 (WTE1)', reference: 'DS-KH6350-WTE1', categorie: 'accessoire', prixUnitaire: 52000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Poste intérieur IP 7" TFT 1024×600, Hik-Connect.' },
  { nom: 'IP Indoor Station KH6 (screen)', reference: 'DS-KH6320-WTE1', categorie: 'accessoire', prixUnitaire: 52000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Poste intérieur IP 7" tactile, PoE, messages/captures.' },
  { nom: 'Analog Four Wire Indoor Station', reference: 'DS-KH2220', categorie: 'accessoire', prixUnitaire: 25000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Poste intérieur analogique 4 fils, écran 7" 800×480.' },

  // ===== Caméras analogiques =====
  { nom: '2 MP Fixed Mini Bullet Camera', reference: 'DS-2CE16D0T-EXIPF', categorie: 'camera', prixUnitaire: 7500, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Caméra analogique mini bullet 2MP fixe.' },
  { nom: '2 MP Indoor Fixed Turret Camera', reference: 'DS-2CE76D0T-EXIPF', categorie: 'camera', prixUnitaire: 7500, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Caméra analogique turret intérieure 2MP.' },
  { nom: 'Analog 2MP Dual Light Hybrid Audio Bullet', reference: 'DS-2CE16D0T-LPFS', categorie: 'camera', prixUnitaire: 11500, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Bullet 2MP double lumière IR/blanc 20m, audio.' },
  { nom: 'Analog 2MP Dual Light Hybrid Audio Turret', reference: 'DS-2CE76D0T-LPFS', categorie: 'camera', prixUnitaire: 11500, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Turret 2MP double lumière IR/blanc 20m, audio.' },
  { nom: '2MP ColorVu Smart Hybrid Mini Bullet Audio', reference: 'DS-2CE10DF0T-LPFS', categorie: 'camera', prixUnitaire: 13500, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Bullet 2MP ColorVu F1.0, 20m blanc, 20m IR.' },
  { nom: '2MP ColorVu Smart Hybrid Mini Dome Audio', reference: 'DS-2CE70DF0T-LPFS', categorie: 'camera', prixUnitaire: 13500, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Dôme 2MP ColorVu F1.0, 20m blanc, 20m IR.' },
  { nom: '5MP/3K Dual Light Bullet Audio', reference: 'DS-2CE16K0T-LPFS', categorie: 'camera', prixUnitaire: 16000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Bullet 5MP/3K 2960×1665, double lumière 20m.' },
  { nom: '5MP/3K Dual Light Dome Audio', reference: 'DS-2CE76K0T-LPFS', categorie: 'camera', prixUnitaire: 16000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Dôme 5MP/3K double lumière 20m.' },
  { nom: '5MP/3K ColorVu Mini Bullet Audio', reference: 'DS-2CE10KF0T-LPFS', categorie: 'camera', prixUnitaire: 20000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Bullet 5MP/3K ColorVu, mic intégré.' },
  { nom: '5MP/3K ColorVu Mini Dome Audio', reference: 'DS-2CE70KF0T-LPFS', categorie: 'camera', prixUnitaire: 20000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Dôme 5MP/3K ColorVu, mic intégré.' },
  { nom: '3K Two-Way Audio & Siren Mini Bullet', reference: 'DS-2CE16K0T-LPTS', categorie: 'camera', prixUnitaire: 19000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Bullet analogique 3K, sirène, audio bidirectionnel.' },
  { nom: '2MP Two-Way Audio & Siren Mini Bullet', reference: 'DS-2CE78D0T-LTS', categorie: 'camera', prixUnitaire: 14000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Bullet analogique 2MP sirène.' },
  { nom: '2MP Two-Way Audio Fixed PT Camera', reference: 'DS-2CE70D0T-PTLTS', categorie: 'camera', prixUnitaire: 20000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'PT 2MP, IR 25m, blanc 20m, Smart-Hybrid Light.' },
  { nom: '2MP Two-Way Audio & Siren PT', reference: 'DS-2CE70D0T-PTLXTS', categorie: 'camera', prixUnitaire: 24000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'PT 2MP sirène + audio bidirectionnel.' },

  // ===== DVR 2MP =====
  { nom: 'DVR 4 Ch 2MP 1080p Audio 1U', reference: 'DS-7204HGHI-M1', categorie: 'enregistreur', prixUnitaire: 21000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'DVR 4ch 2MP H.265 Motion 2.0, jusqu\'à 5-ch IP.' },
  { nom: 'DVR 8 Ch 2MP 1080p Audio 1U', reference: 'DS-7208HGHI-M1', categorie: 'enregistreur', prixUnitaire: 26000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'DVR 8ch 2MP H.265.' },
  { nom: 'DVR 16 Ch 2MP 1080p Audio 1U', reference: 'DS-7216HGHI-M1', categorie: 'enregistreur', prixUnitaire: 47000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'DVR 16ch 2MP H.265.' },
  { nom: 'DVR 32 Ch 2MP 1080p Pro', reference: 'DS-7232HGHI-M2', categorie: 'enregistreur', prixUnitaire: 135000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'DVR 32ch Pro Series.' },

  // ===== eDVR 2MP =====
  { nom: 'eDVR 4 Ch 2MP eSSD 1TB', reference: 'DS-E04HGHI-E', categorie: 'enregistreur', prixUnitaire: 48000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'eDVR 4ch eSSD 1TB intégré, deep learning.' },
  { nom: 'eDVR 8 Ch 2MP eSSD 1TB', reference: 'DS-E08HGHI-D', categorie: 'enregistreur', prixUnitaire: 55000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'eDVR 8ch eSSD 1TB.' },
  { nom: 'eDVR 16 Ch 2MP eSSD 1TB', reference: 'DS-E16HGHI-B', categorie: 'enregistreur', prixUnitaire: 70000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'eDVR 16ch eSSD 1TB.' },

  // ===== DVR 5MP/3K =====
  { nom: 'DVR 4 Ch 5MP/3K Acusense', reference: 'iDS-7204HQHI-M1', categorie: 'enregistreur', prixUnitaire: 42000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'DVR AcuSense 4ch 5MP/3K 1444p deep learning.' },
  { nom: 'DVR 8 Ch 5MP/3K Acusense', reference: 'iDS-7208HQHI-M1/XT', categorie: 'enregistreur', prixUnitaire: 55000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'DVR AcuSense 8ch 5MP/3K.' },
  { nom: 'DVR 16 Ch 5MP/3K Acusense', reference: 'iDS-7216HQHI-M1/XT', categorie: 'enregistreur', prixUnitaire: 95000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'DVR AcuSense 16ch 5MP/3K.' },
  { nom: 'DVR 32 Ch 5MP/3K Acusense', reference: 'iDS-7232HQHI-M2/XT', categorie: 'enregistreur', prixUnitaire: 185000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'DVR AcuSense 32ch, 2HDD, jusqu\'à 40 caméras IP.' },

  // ===== Power Supply =====
  { nom: 'Power Supply 8 Ch 12V 5A', reference: 'DS-2FA1205-C8', categorie: 'accessoire', prixUnitaire: 6000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Alimentation CCTV 8 sorties 12V 5A.' },
  { nom: 'Power Supply 16 Ch 12V 8A', reference: 'DS-2FA1208-C16', categorie: 'accessoire', prixUnitaire: 7000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Alimentation CCTV 60W 16 sorties 12V 1A/ch.' },
  { nom: 'Power Supply 4 Ch 12V', reference: 'DS-2FA1225-C4', categorie: 'accessoire', prixUnitaire: 5000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Alimentation CCTV 4 sorties 12V 1A/ch.' },

  // ===== IP Solar Camera =====
  { nom: 'Solar PT Camera 4MP 4G', reference: 'DS-2DE2C400IWG-K/4G/C05S10', categorie: 'camera', prixUnitaire: 120000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: '4MP PT solaire 4G LTE, PIR+Radar, IP66, SD 512GB.' },
  { nom: 'Solar Bullet Camera 4MP 4G', reference: 'DS-2XS2T41G1-ID_4G_C05S0', categorie: 'camera', prixUnitaire: 95000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Bullet 4MP solaire batterie intégrée, 4G, audio bidirectionnel.' },

  // ===== IP 4K 80m =====
  { nom: '8MP AcuSense Smart Hybrid Bullet 80m', reference: 'DS-2CD2T83G2-4LI', categorie: 'camera', prixUnitaire: 90000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Bullet IP 8MP AcuSense, portée 80m.' },
  { nom: '4MP AcuSense Bullet 80m', reference: 'DS-2CD2T43G2-4LI', categorie: 'camera', prixUnitaire: 70000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Bullet IP 4MP AcuSense fixe 80m.' },

  // ===== IP CAMERA 60m-50m =====
  { nom: '4MP AcuSense Motorized Bullet', reference: 'DS-2CD2643G2-IZS', categorie: 'camera', prixUnitaire: 110000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Bullet 4MP motorisée varifocal, WDR 120dB, IP67/IK10.' },
  { nom: '6MP Dual Light MD 2.0 Motorized Bullet', reference: 'DS-2CD1663G2-LIZSU', categorie: 'camera', prixUnitaire: 80000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Bullet 6MP varifocal 2.8-12mm motorisée, SD 512GB.' },
  { nom: '6MP Dual Light MD 2.0 Motorized Dome', reference: 'DS-2CD1763G2-LIZ(S)U', categorie: 'camera', prixUnitaire: 80000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Dôme 6MP varifocal 2.8-12mm motorisée.' },
  { nom: '6MP Dual Light Motorized Bullet (SL)', reference: 'DS-2CD1663G2-LIZSU_SL', categorie: 'camera', prixUnitaire: 80000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Bullet 6MP Smart Hybrid Light varifocal motorisée.' },

  // ===== IP Panoramic 180 =====
  { nom: '4MP Panoramic 180 ColorVu Bullet (Strobe+Siren)', reference: 'DS-2CD2T47G2P-LSU_SL', categorie: 'camera', prixUnitaire: 105000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Bullet 4MP panoramique 180°, ColorVu, sirène, stroboscope.' },
  { nom: '4MP Panoramic 180 ColorVu Turret (Strobe+Siren)', reference: 'DS-2CD2347G2P-LSU_SL', categorie: 'camera', prixUnitaire: 105000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Turret 4MP panoramique 180°, ColorVu.' },

  // ===== IP two-way + alarme =====
  { nom: '2MP ColorVu Smart Hybrid Bullet', reference: 'DS-2CD1027G2H-LIUF_S', categorie: 'camera', prixUnitaire: 32000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Bullet IP 2MP ColorVu, détection humain/véhicule.' },
  { nom: '2MP ColorVu Smart Hybrid Turret', reference: 'DS-2CD1327G2H-LIUF_S', categorie: 'camera', prixUnitaire: 32000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Turret IP 2MP ColorVu.' },
  { nom: '4MP ColorVu Smart Hybrid Bullet', reference: 'DS-2CD1047G2H-LIUF_SRB', categorie: 'camera', prixUnitaire: 45000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Bullet IP 4MP ColorVu.' },
  { nom: '4MP ColorVu Smart Hybrid Turret', reference: 'DS-2CD1347G2H-LIUF_S', categorie: 'camera', prixUnitaire: 45000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Turret IP 4MP ColorVu.' },
  { nom: '6MP ColorVu Smart Hybrid Bullet', reference: 'DS-2CD1067G2H-LIUF_S', categorie: 'camera', prixUnitaire: 55000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Bullet IP 6MP ColorVu.' },
  { nom: '6MP ColorVu Smart Hybrid Turret', reference: 'DS-2CD1367G2H-LIUF_S', categorie: 'camera', prixUnitaire: 55000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Turret IP 6MP ColorVu.' },
  { nom: '4MP ColorVu Smart Hybrid Bullet 50m', reference: 'DS-2CD1T47G2H-LIUF_S', categorie: 'camera', prixUnitaire: 60000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Bullet IP 4MP ColorVu 50m.' },

  // ===== IP Camera 2/4/6 MP =====
  { nom: '2MP Smart Dual Light Dome (Audio)', reference: 'DS-2CD1123G2-LIU', categorie: 'camera', prixUnitaire: 24000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Dôme IP 2MP double lumière, WDR 120dB, H.265+.' },
  { nom: '2MP Smart Dual Light Bullet (Audio)', reference: 'DS-2CD1023G2-LIU', categorie: 'camera', prixUnitaire: 23000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Bullet IP 2MP double lumière, audio.' },
  { nom: '2MP ColorVu Bullet Audio', reference: 'DS-2CD1027G2H-LIU(F)', categorie: 'camera', prixUnitaire: 27000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Bullet IP 2MP ColorVu audio.' },
  { nom: '2MP ColorVu Dome Audio', reference: 'DS-2CD1327G2H-LIU', categorie: 'camera', prixUnitaire: 27000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Dôme IP 2MP ColorVu audio.' },
  { nom: '4MP Smart Dual Light Bullet Audio', reference: 'DS-2CD1043G2-LIU', categorie: 'camera', prixUnitaire: 33000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Bullet IP 4MP double lumière.' },
  { nom: '4MP Smart Dual Light Dome Audio', reference: 'DS-2CD1143G2-LIU', categorie: 'camera', prixUnitaire: 33000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Dôme IP 4MP double lumière.' },
  { nom: '4MP ColorVu Bullet Audio', reference: 'DS-2CD1047G2H-LIU', categorie: 'camera', prixUnitaire: 40000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Bullet IP 4MP ColorVu audio.' },
  { nom: '4MP ColorVu Dome Audio', reference: 'DS-2CD1147G2H-LIU', categorie: 'camera', prixUnitaire: 40000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Dôme IP 4MP ColorVu audio.' },
  { nom: '4MP AcuSense Smart Hybrid Dome (Dual Mic)', reference: 'DS-2CD2143G2-LIS2U', categorie: 'camera', prixUnitaire: 55000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Dôme 4MP AcuSense, double micro.' },
  { nom: '4MP AcuSense Smart Hybrid Bullet (Dual Mic)', reference: 'DS-2CD2043G2-LI2U', categorie: 'camera', prixUnitaire: 55000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Bullet 4MP AcuSense, double micro.' },
  { nom: '6MP Smart Hybrid Bullet', reference: 'DS-2CD1063G2-LIUF/SL', categorie: 'camera', prixUnitaire: 43000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Bullet IP 6MP Smart Hybrid Light.' },
  { nom: '6MP Smart Hybrid Turret', reference: 'DS-2CD1363G2-LIUF_SL', categorie: 'camera', prixUnitaire: 43000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Turret IP 6MP Smart Hybrid Light.' },
  { nom: '6MP AcuSense Bullet (Dual Mic) 40m', reference: 'DS-2CD2063G2-LI(2U)', categorie: 'camera', prixUnitaire: 65000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Bullet 6MP AcuSense 40m double micro.' },
  { nom: '6MP AcuSense Dome (Dual Mic) 40m', reference: 'DS-2CD2163G2-LI(S)(2U)', categorie: 'camera', prixUnitaire: 65000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Dôme 6MP AcuSense 40m double micro.' },
  { nom: '4MP ColorVu Bullet 50m', reference: 'DS-2CD1T47G2H-LIU(F)', categorie: 'camera', prixUnitaire: 55000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Bullet 4MP ColorVu 50m, SD 512GB.' },
  { nom: '6MP Smart Hybrid Bullet 50m', reference: 'DS-2CD1T63G2-LIU(F)', categorie: 'camera', prixUnitaire: 55000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Bullet 6MP Smart Hybrid Light 50m.' },
  { nom: '4MP Motorized Varifocal Dome', reference: 'DS-2CD1743G0-I(Z)', categorie: 'camera', prixUnitaire: 65000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Dôme 4MP varifocal 2.8-12mm motorisée, IP67/IK10.' },
  { nom: '4MP Motorized Varifocal Bullet', reference: 'DS-2CD1643G0-I(Z)', categorie: 'camera', prixUnitaire: 65000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Bullet 4MP varifocal 2.8-12mm motorisée.' },

  // ===== ANPR / DeepinView =====
  { nom: '4MP DeepinView ANPR Bullet', reference: 'iDS-2CD7A46G0/P-IZHS', categorie: 'camera', prixUnitaire: 300000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: '4MP DeepinView ANPR moto varifocal bullet.' },
  { nom: '8MP DeepinView ANPR Bullet', reference: 'iDS-2CD7A86G2/P-IZHS', categorie: 'camera', prixUnitaire: 380000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: '8MP DeepinView ANPR bullet DarkFighter 2.0, IP67/IK10.' },
  { nom: '8MP DeepinView Bullet', reference: 'iDS-2CD7A86G2-IZHS', categorie: 'camera', prixUnitaire: 350000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: '8MP DeepinView bullet, ShotN, 60fps.' },

  // ===== PTZ IP =====
  { nom: 'PTZ TandemVu 4" 4MP 25X ColorVu+IR', reference: 'DS-2SE4C425MWG-E/14F0', categorie: 'camera', prixUnitaire: 230000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'PTZ TandemVu 4MP 25X ColorVu+IR DarkFighter.' },
  { nom: 'PTZ TandemVu 4MP+4MP 4X PoE', reference: 'DS-2SE3C404MWG-E/14', categorie: 'camera', prixUnitaire: 105000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'PTZ TandemVu 4MP+4MP 4X PoE réseau.' },
  { nom: 'Mini PT Dome 4MP IR (audio)', reference: 'DS-2DE2C400MW-DE', categorie: 'camera', prixUnitaire: 35000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'PT mini 4MP IR IP66, Hik-Connect, SD.' },
  { nom: 'PTZ 4MP DarkFighter 25X 4"', reference: 'DS-2DE4425IW-DE(T5)', categorie: 'camera', prixUnitaire: 195000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'PTZ 4MP DarkFighter 25X.' },
  { nom: 'TandemVu 6+4MP 25X Panoramic PTZ', reference: 'DS-2SE4C425MWG-E/26F0', categorie: 'camera', prixUnitaire: 250000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'PTZ TandemVu 6+4MP 25X ColorVu+IR 100m, PoE+.' },
  { nom: 'TandemVu 6+4MP 25X AcuSense Panoramic', reference: 'DS-2SE7C425MWG-EB/26F0', categorie: 'camera', prixUnitaire: 350000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Speed dome TandemVu 6+4MP 25X AcuSense.' },
  { nom: 'TandemVu 6+4MP 32X AcuSense Panoramic', reference: 'DS-2SE7C432MWG-EB/26F0', categorie: 'camera', prixUnitaire: 400000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Speed dome TandemVu 6+4MP 32X AcuSense.' },
  { nom: 'Speed Dome 4MP 25X DarkFighter', reference: 'DS-2DE5425IW-AE(T5)', categorie: 'camera', prixUnitaire: 240000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Speed dome IP 4MP 25X DarkFighter, IR 150m.' },

  // ===== Wi-Fi Cameras =====
  { nom: '2MP Indoor Fixed PT Wi-Fi', reference: 'DS-2CV2Q21G1-IDW', categorie: 'camera', prixUnitaire: 25000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Caméra intérieure PT Wi-Fi 2MP, micro/HP, SD 512GB.' },
  { nom: '4MP H.265 Two Bullet Wi-Fi NVS Kit', reference: 'NKS424W0H', categorie: 'camera', prixUnitaire: 55000, unite: 'KIT', stockQuantite: 0, stockMinimum: 1, description: 'Kit Wi-Fi 4MP 2 bullets H.265.' },
  { nom: '4MP H.265 Bullet + PTDome Wi-Fi NVS Kit', reference: 'NKS424W03H', categorie: 'camera', prixUnitaire: 65000, unite: 'KIT', stockQuantite: 0, stockMinimum: 1, description: 'Kit Wi-Fi 4MP 1 bullet + 1 PT dôme.' },
  { nom: '4MP Outdoor Audio Bullet Wi-Fi', reference: 'DS-2CV2041G2-IDW', categorie: 'camera', prixUnitaire: 50000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Bullet extérieure Wi-Fi 4MP audio, EXIR 2.0.' },
  { nom: '4MP Outdoor Audio Dome Wi-Fi (Black)', reference: 'DS-2CV2141G2-IDW-B', categorie: 'camera', prixUnitaire: 50000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Dôme extérieur Wi-Fi 4MP audio.' },
  { nom: '4MP Outdoor Audio Dome Wi-Fi (White)', reference: 'DS-2CV2141G2-IDW-W', categorie: 'camera', prixUnitaire: 45000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Dôme extérieur Wi-Fi 4MP audio, blanc.' },

  // ===== NVR DeepinMind =====
  { nom: 'NVR 8ch 8 PoE 8K DeepinMind', reference: 'iDS-7608NXI-M2/8P/X', categorie: 'enregistreur', prixUnitaire: 400000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR 8ch DeepinMind 8K, 8 PoE, IA avancée.' },
  { nom: 'NVR 16ch 16 PoE 8K DeepinMind', reference: 'iDS-7616NXI-M2/16P/X', categorie: 'enregistreur', prixUnitaire: 450000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR 16ch DeepinMind 8K, 16 PoE.' },
  { nom: 'NVR 16ch 8K DeepinMind', reference: 'iDS-7616NXI-M2/X', categorie: 'enregistreur', prixUnitaire: 350000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR 16ch DeepinMind 8K sans PoE.' },
  { nom: 'NVR 32ch 16 PoE 8K DeepinMind', reference: 'iDS-7732NXI-M4/16P/X', categorie: 'enregistreur', prixUnitaire: 600000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR 32ch DeepinMind 8K, 16 PoE, 4 HDD.' },
  { nom: 'NVR 32ch 8K DeepinMind', reference: 'iDS-7732NXI-M4/X', categorie: 'enregistreur', prixUnitaire: 520000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR 32ch DeepinMind 8K sans PoE.' },

  // ===== POE NVR =====
  { nom: 'NVR 4ch PoE Value 1HDD', reference: 'DS-7104NI-Q1/4P', categorie: 'enregistreur', prixUnitaire: 45000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'NVR 4ch PoE Value 4MP.' },
  { nom: 'NVR 8ch PoE Value 1HDD', reference: 'DS-7108NI-Q1/8P', categorie: 'enregistreur', prixUnitaire: 65000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'NVR 8ch PoE Value 4MP.' },
  { nom: 'NVR AcuSense 8ch PoE Pro', reference: 'DS-7608NXI-K1-8P', categorie: 'enregistreur', prixUnitaire: 100000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR 8ch PoE Pro AcuSense 8MP.' },
  { nom: 'NVR 16ch PoE K Series 4K', reference: 'DS-7616NXI-K2/16P', categorie: 'enregistreur', prixUnitaire: 170000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR 16ch PoE K AcuSense 4K.' },
  { nom: 'NVR 16ch PoE Pro Q', reference: 'DS-7616NI-Q2-16P', categorie: 'enregistreur', prixUnitaire: 125000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR 16ch PoE Pro 2HDD 8MP.' },
  { nom: 'NVR AcuSense 32ch PoE Pro', reference: 'DS-7632NXI-K2/16P', categorie: 'enregistreur', prixUnitaire: 195000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR 32ch PoE K AcuSense 8MP.' },

  // ===== Non-PoE NVR =====
  { nom: 'NVR 4ch 4K', reference: 'DS-7604NI-K1', categorie: 'enregistreur', prixUnitaire: 45000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'NVR 4ch 4K non-PoE.' },
  { nom: 'NVR AcuSense 4K 8ch (Non-PoE)', reference: 'DS-7608NXI-K1', categorie: 'enregistreur', prixUnitaire: 55000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'NVR AcuSense 4K 8ch 1HDD.' },
  { nom: 'NVR AcuSense 4K 16ch (Non-PoE)', reference: 'DS-7616NXI-K1', categorie: 'enregistreur', prixUnitaire: 60000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR AcuSense 4K 16ch 1HDD.' },
  { nom: 'NVR AcuSense 4K 32ch (Non-PoE)', reference: 'DS-7632NXI-K2', categorie: 'enregistreur', prixUnitaire: 130000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR AcuSense 4K 32ch 2HDD.' },
  { nom: 'NVR AcuSense 4K 32ch 1.5U (Non-PoE)', reference: 'DS-7732NXI-K4', categorie: 'enregistreur', prixUnitaire: 195000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR 32ch 1.5U 4HDD.' },
  { nom: 'NVR AcuSense 8K 64ch 1.5U', reference: 'DS-7764NI-M4', categorie: 'enregistreur', prixUnitaire: 365000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR 8K 64ch 4HDD non-PoE.' },
  { nom: 'NVR 32ch 2U 8K', reference: 'DS-9632NI-M8', categorie: 'enregistreur', prixUnitaire: 500000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'NVR 32ch 2U 8K, 2 HDMI + 2 VGA, ANPR.' },

  // ===== NVR eSSD =====
  { nom: 'eNVR PoE 4ch 1TB', reference: 'DS-E04NI-Q1/4P', categorie: 'enregistreur', prixUnitaire: 85000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'eNVR PoE 4ch eSSD 1TB intégré.' },
  { nom: 'eNVR PoE 8ch 1TB', reference: 'DS-E08NI-Q1/8P', categorie: 'enregistreur', prixUnitaire: 100000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'eNVR PoE 8ch eSSD 1TB intégré.' },

  // ===== PoE Switch =====
  { nom: 'Switch PoE 4 ports Fast Ethernet', reference: 'DS-3E1105P-EI/M', categorie: 'reseau', prixUnitaire: 19000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Switch PoE 4×100Mbps + 1 uplink, 60W.' },
  { nom: 'Switch PoE 8 ports Gigabit', reference: 'DS-3E1510P-EI/M', categorie: 'reseau', prixUnitaire: 38000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Switch PoE 8 Gbps + 2 uplink, 60W, VLAN.' },
  { nom: 'Switch PoE 16 ports Gigabit', reference: 'DS-3E1518P-EI/M', categorie: 'reseau', prixUnitaire: 105000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Switch PoE 16 Gbps + uplink RJ45 + fibre.' },
  { nom: 'Switch PoE 24 ports Gigabit', reference: 'DS-3E1526P-EI/M', categorie: 'reseau', prixUnitaire: 135000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Switch PoE 24 Gbps, 230W, cloud management.' },

  // ===== Audio =====
  { nom: 'Analog Audio Kit 60W + 2×20W Column', reference: 'DS-QAE0KA60120-2', categorie: 'accessoire', prixUnitaire: 130000, unite: 'KIT', stockQuantite: 0, stockMinimum: 1, description: 'Kit audio 60W ampli 2 zones + 2 enceintes colonne 20W.' },
  { nom: 'Analog Column Speaker 20W', reference: 'DS-QAE0420G1-V', categorie: 'accessoire', prixUnitaire: 45000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Enceinte colonne 20W haute sensibilité.' },
  { nom: 'Analog Audio Kit 60W + 4×6W Ceiling', reference: 'DS-QAE0KA60206-4', categorie: 'accessoire', prixUnitaire: 90000, unite: 'KIT', stockQuantite: 0, stockMinimum: 1, description: 'Kit ampli 60W + 4 HP encastrables 6W.' },
  { nom: 'Analog Ceiling Speaker 6W', reference: 'DS-QAE0206G1-V', categorie: 'accessoire', prixUnitaire: 90000, unite: 'PCS', stockQuantite: 0, stockMinimum: 4, description: 'HP plafond 6W à ressort.' },
  { nom: 'Portable Conference Camera 2MP', reference: 'DS-UVC-X12', categorie: 'camera', prixUnitaire: 110000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Caméra conférence portable 2MP WDR 120dB.' },
  { nom: 'Gooseneck Paging Microphone', reference: 'DS-QAE0MG0G1', categorie: 'accessoire', prixUnitaire: 25000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Micro paging col de cygne haute sensibilité.' },

  // ===== Alarme sans fil AX Pro =====
  { nom: 'Wireless Magnet Detector', reference: 'DS-PDMC-EG2-WE', categorie: 'accessoire', prixUnitaire: 13000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Détecteur d\'ouverture sans fil 868MHz.' },
  { nom: 'Wireless PIR-Camera Detector', reference: 'DS-PDPC12PF-EG2-WB', categorie: 'accessoire', prixUnitaire: 45000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Détecteur PIR + caméra 12m, immunité animaux 30kg, ColorVu.' },
  { nom: 'Wireless PIR-Camera Detector (868MHz)', reference: 'DS-PDPC12P-EG2-WE', categorie: 'accessoire', prixUnitaire: 30000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Détecteur PIR+cam 868MHz 12m.' },
  { nom: 'Wireless PIR Detector', reference: 'DS-PDP15P-EG2-WE', categorie: 'accessoire', prixUnitaire: 18000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Détecteur PIR sans fil 868MHz.' },
  { nom: 'AX Pro Wireless Alarm Panel Kit', reference: 'DS-PWA64-Kit-WE', categorie: 'accessoire', prixUnitaire: 90000, unite: 'KIT', stockQuantite: 0, stockMinimum: 1, description: 'Centrale AX Pro 64 zones 868MHz longue portée.' },
  { nom: 'AX Hybrid Pro Kit', reference: 'DS-PHA64-Kit-WE', categorie: 'accessoire', prixUnitaire: 85000, unite: 'KIT', stockQuantite: 0, stockMinimum: 1, description: 'Centrale hybride AX Pro 64 zones 868MHz.' },
  { nom: 'Outdoor Wireless Triple Signal Detector', reference: 'DS-PDTT15AM-LM-WE', categorie: 'accessoire', prixUnitaire: 60000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Détecteur extérieur triple technologie IP65.' },
  { nom: 'Wireless Sounder / Siren', reference: 'DS-PS1-E-WE', categorie: 'accessoire', prixUnitaire: 38000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Sirène extérieure sans fil 868MHz.' },
  { nom: 'Wireless LCD Keypad', reference: 'DS-PK1-LT-WE', categorie: 'accessoire', prixUnitaire: 45000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Clavier LCD sans fil bidirectionnel 868MHz.' },
  { nom: 'Wireless Emergency Button', reference: 'DS-PDEB1-EG2-WE', categorie: 'accessoire', prixUnitaire: 12000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Bouton d\'urgence sans fil IP66.' },
  { nom: 'Wired LCD Keypad', reference: 'DS-PK1-LRT-HWE', categorie: 'accessoire', prixUnitaire: 35000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Clavier LCD filaire, 64 télécommandes.' },
  { nom: 'Single Input Transmitter', reference: 'DS-PM1-I1-WE', categorie: 'accessoire', prixUnitaire: 18000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Émetteur 1 entrée sans fil 868MHz.' },
  { nom: 'Wireless Repeater', reference: 'DS-PR1-WE', categorie: 'accessoire', prixUnitaire: 38000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Répéteur sans fil 868MHz.' },
  { nom: 'Wireless Internal Sounder', reference: 'DS-PS1-I-WE', categorie: 'accessoire', prixUnitaire: 24000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Sirène intérieure sans fil AES-128.' },
  { nom: 'Surface Magnetic Contact (Plastic)', reference: 'DS-PD1-MC-WS', categorie: 'accessoire', prixUnitaire: 2000, unite: 'PCS', stockQuantite: 0, stockMinimum: 10, description: 'Contact magnétique de surface ABS NC.' },
  { nom: 'Surface Magnetic Contact (Metal)', reference: 'DS-PD1-MC-MS', categorie: 'accessoire', prixUnitaire: 3500, unite: 'PCS', stockQuantite: 0, stockMinimum: 10, description: 'Contact magnétique métal NC, gap 40mm.' },

  // ===== UPS =====
  { nom: 'UPS 1000VA AVR', reference: 'DS-UPS1000', categorie: 'accessoire', prixUnitaire: 27000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Onduleur 1000VA/600W AVR, batterie 12V.' },
  { nom: 'UPS 2000VA AVR LCD', reference: 'DS-UPS2000', categorie: 'accessoire', prixUnitaire: 75000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Onduleur 2000VA/1200W LCD, USB.' },
  { nom: 'UPS 3000VA AVR LCD', reference: 'DS-UPS3000', categorie: 'accessoire', prixUnitaire: 115000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Onduleur 3000VA/1800W LCD, USB.' },

  // ===== IP Phones =====
  { nom: 'SIP Phone KP6000', reference: 'DS-KP6000-HE1', categorie: 'accessoire', prixUnitaire: 28000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Téléphone SIP 2.3" 4 lignes, PoE, G.722/Opus.' },
  { nom: 'SIP Phone KP8000 Wi-Fi', reference: 'DS-KP8000-WHE1', categorie: 'accessoire', prixUnitaire: 40000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Téléphone SIP écran couleur 2.8", Wi-Fi, PoE, H.264 1080p.' },

  // ===== Disques durs =====
  { nom: 'HDD 1TB WD Blue', reference: 'WD10EZEX', categorie: 'accessoire', prixUnitaire: 24000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Disque dur 1TB 7200 RPM SATA 6Gb/s.' },
  { nom: 'HDD 2TB WD Purple', reference: 'WD20PURZ', categorie: 'accessoire', prixUnitaire: 35000, unite: 'PCS', stockQuantite: 0, stockMinimum: 3, description: 'Disque dur vidéosurveillance 2TB SATA III.' },
  { nom: 'HDD 4TB WD Purple', reference: 'WD40PURZ', categorie: 'accessoire', prixUnitaire: 60000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Disque dur vidéosurveillance 4TB.' },
  { nom: 'HDD 6TB WD Purple', reference: 'WD60PURZ', categorie: 'accessoire', prixUnitaire: 85000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Disque dur vidéosurveillance 6TB.' },
  { nom: 'HDD 8TB WD Purple', reference: 'WD84PURZ', categorie: 'accessoire', prixUnitaire: 115000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Disque dur vidéosurveillance 8TB 128MB cache.' },

  // ===== Câbles réseau =====
  { nom: 'FTP Cat6a Network Cable 305m', reference: 'DS-1LN6APSL4', categorie: 'cable', prixUnitaire: 135000, unite: 'ROULEAU', stockQuantite: 0, stockMinimum: 1, description: 'FTP Cat6a cuivre pur 0.560mm, LSZH 305m, 10GB.' },
  { nom: 'CAT6 U/UTP Network Cable 305m (Orange)', reference: 'DS-1LN6U-SC0_AS', categorie: 'cable', prixUnitaire: 90000, unite: 'ROULEAU', stockQuantite: 0, stockMinimum: 1, description: 'Cat6 4PR 23AWG cuivre solide, 305m orange.' },
  { nom: 'CAT6 UTP CCA Network Cable 305m', reference: 'DS-1LN6U-W_CCA', categorie: 'cable', prixUnitaire: 40000, unite: 'ROULEAU', stockQuantite: 0, stockMinimum: 1, description: 'Cat6 UTP CCA 0.565mm 305m, longue portée PoE.' },
  { nom: 'FTTH Fiber G.657A1', reference: 'DS-FOGX-B6A1-L0', categorie: 'cable', prixUnitaire: 38000, unite: 'ROULEAU', stockQuantite: 0, stockMinimum: 1, description: 'Fibre FTTH G.657A1, intérieur/aérien.' },
  { nom: 'Coaxial Cable 20m (CCTV)', reference: '20M_Coaxial_Cable', categorie: 'cable', prixUnitaire: 3500, unite: 'PCS', stockQuantite: 0, stockMinimum: 5, description: 'Câble coaxial pré-monté 20m pour CCTV.' },

  // ===== Accessoires caméras =====
  { nom: 'Video Balun HD (8MP/3K/5MP/2MP)', reference: 'DS-1H18S_E(C)_AS', categorie: 'accessoire', prixUnitaire: 1500, unite: 'PAIRE', stockQuantite: 0, stockMinimum: 10, description: 'Balun vidéo HD TVI/CVI/AHD, UTP.' },
  { nom: 'BNC Connectors', reference: 'BNC_CONNECTORS', categorie: 'accessoire', prixUnitaire: 200, unite: 'PCS', stockQuantite: 0, stockMinimum: 50, description: 'Connecteur BNC.' },
  { nom: 'Male Power Connector', reference: 'POWER_CONNECTORS_M', categorie: 'accessoire', prixUnitaire: 120, unite: 'PCS', stockQuantite: 0, stockMinimum: 50, description: 'Connecteur d\'alim mâle.' },
  { nom: 'Female Power Connector', reference: 'POWER_CONNECTORS_F', categorie: 'accessoire', prixUnitaire: 120, unite: 'PCS', stockQuantite: 0, stockMinimum: 50, description: 'Connecteur d\'alim femelle.' },
  { nom: 'Junction Box (Aluminum, White)', reference: 'DS-1280ZJ-DM18', categorie: 'accessoire', prixUnitaire: 5000, unite: 'PCS', stockQuantite: 0, stockMinimum: 5, description: 'Boîte de jonction alu blanche Hikvision.' },
  { nom: 'Wall Mount (Plastic/Steel White)', reference: 'DS-1294ZJ-PT', categorie: 'accessoire', prixUnitaire: 7000, unite: 'PCS', stockQuantite: 0, stockMinimum: 5, description: 'Support mural caméra blanc Hikvision.' },

  // ===== Informatique / Réseau =====
  { nom: 'RJ45 Cat5e Plug (Gold)', reference: 'DS-1M01', categorie: 'reseau', prixUnitaire: 5000, unite: 'BOITE', stockQuantite: 0, stockMinimum: 2, description: 'Connecteur RJ45 Cat5e plaqué or, 1000 Base-T.' },
  { nom: 'Cable Management 1U 24-slot', reference: 'DS-1CM1U24', categorie: 'reseau', prixUnitaire: 7000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Guide-câbles 1U 24 slots.' },
  { nom: 'Cable Management 1U 12-slot', reference: 'DS-1CM1U12', categorie: 'reseau', prixUnitaire: 6000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Guide-câbles 1U 12 slots.' },
  { nom: 'Cat6a Keystone Jack 180°', reference: 'DS-1CK6AU180T', categorie: 'reseau', prixUnitaire: 2000, unite: 'PCS', stockQuantite: 0, stockMinimum: 20, description: 'Keystone Cat6a non blindée 180°.' },
  { nom: 'Cat6 Keystone Jack 180°', reference: 'DS-1CK6U180T', categorie: 'reseau', prixUnitaire: 1000, unite: 'PCS', stockQuantite: 0, stockMinimum: 20, description: 'Keystone Cat6 non blindée 180°.' },
  { nom: 'Cat6 Patch Panel 24-port 1U', reference: 'DS-1CP6U24-1U', categorie: 'reseau', prixUnitaire: 25000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Panneau brassage Cat6 24 ports 1U.' },
  { nom: 'Blank Patch Panel 24-port 1U', reference: 'DS-1CP0P24-1U', categorie: 'reseau', prixUnitaire: 12000, unite: 'PCS', stockQuantite: 0, stockMinimum: 2, description: 'Panneau brassage blindé vide 24 ports 1U.' },
  { nom: 'Kuwes PVC Dual Face Plate Cat6', reference: 'KUWES-FP-DUAL', categorie: 'reseau', prixUnitaire: 2500, unite: 'PCS', stockQuantite: 0, stockMinimum: 10, description: 'Plaque murale double Cat6.' },
  { nom: 'Kuwes Single Face Plate', reference: 'KUWES-FP-SINGLE', categorie: 'reseau', prixUnitaire: 2000, unite: 'PCS', stockQuantite: 0, stockMinimum: 10, description: 'Plaque murale simple.' },

  // ===== Coffrets réseau =====
  { nom: 'Wall Mount Cabinet 15U 600×600', reference: 'CAB-15U-600', categorie: 'reseau', prixUnitaire: 90000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Coffret mural 15U 600×600.' },
  { nom: 'Wall Mount Cabinet 12U 600×600', reference: 'CAB-12U-600', categorie: 'reseau', prixUnitaire: 75000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Coffret mural 12U 600×600.' },
  { nom: 'Wall Mount Cabinet 9U 600×450', reference: 'CAB-9U-450', categorie: 'reseau', prixUnitaire: 60000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Coffret mural 9U 600×450.' },
  { nom: 'Wall Mount Cabinet 6U 600×450', reference: 'CAB-6U-450', categorie: 'reseau', prixUnitaire: 40000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Coffret mural 6U 600×450.' },
  { nom: 'Network Cabinet 4U 600×450', reference: 'CAB-4U-450', categorie: 'reseau', prixUnitaire: 35000, unite: 'PCS', stockQuantite: 0, stockMinimum: 1, description: 'Coffret réseau 4U 600×450.' },

  // ===== Cordons de brassage =====
  { nom: 'Patch Cord Cat6 UTP 0.5m Orange', reference: 'DS-1NP6UEC0-0.5M', categorie: 'cable', prixUnitaire: 750, unite: 'PCS', stockQuantite: 0, stockMinimum: 20, description: 'Cordon brassage Cat6 24AWG cuivre 0.5m.' },
  { nom: 'Patch Cord Cat6 UTP 1m Orange', reference: 'DS-1NP6UEC0-1M', categorie: 'cable', prixUnitaire: 1000, unite: 'PCS', stockQuantite: 0, stockMinimum: 20, description: 'Cordon brassage Cat6 1m orange.' },
  { nom: 'Patch Cord Cat6 UTP 2m Orange', reference: 'DS-1NP6UEC0-2M', categorie: 'cable', prixUnitaire: 1500, unite: 'PCS', stockQuantite: 0, stockMinimum: 20, description: 'Cordon brassage Cat6 2m orange.' },
  { nom: 'Patch Cord Cat6 UTP 3m Orange', reference: 'DS-1NP6UEC0-3M', categorie: 'cable', prixUnitaire: 2000, unite: 'PCS', stockQuantite: 0, stockMinimum: 20, description: 'Cordon brassage Cat6 3m orange.' },
  { nom: 'Patch Cord Cat6 UTP 5m Orange', reference: 'DS-1NP6UEC0-5M', categorie: 'cable', prixUnitaire: 2500, unite: 'PCS', stockQuantite: 0, stockMinimum: 20, description: 'Cordon brassage Cat6 5m orange.' },
];
