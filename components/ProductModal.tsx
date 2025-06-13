// ✅ ProductModal.tsx — avec champ "Autre" + prix unitaire modifiable + total dynamique
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: {
    url: string;
    site: string;
    title: string;
    price: string;
    price_unit: string;
    image: string;
    couleur: string;
    taille: string;
    quantite: number;
    autre: string;
  }) => void;
  product: {
    url: string;
    site: string;
    title: string;
    price: string;
    image: string;
  } | null;
}

export default function ProductModal({ visible, onClose, onAdd, product }: Props) {
  const [taille, setTaille] = useState('');
  const [couleur, setCouleur] = useState('');
  const [quantiteStr, setQuantiteStr] = useState('1');
  const [priceUnit, setPriceUnit] = useState('');
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [autre, setAutre] = useState('');

  useEffect(() => {
    if (product?.price) setPriceUnit(formatPrix(product.price));
  }, [product]);

  const formatPrix = (value: string) => {
    const clean = value.replace(/[^0-9,\.]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    if (isNaN(num)) return '';
    return num.toFixed(2);
  };

  const handlePrixChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = cleaned.split('.');
    if (parts.length === 2) {
      parts[1] = parts[1].slice(0, 2);
    }
    setPriceUnit(parts.join('.'));
  };

  const quantite = parseInt(quantiteStr) || 1;
  const total = priceUnit ? (parseFloat(priceUnit) * quantite).toFixed(2) : '';

  if (!product) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Image source={{ uri: product.image }} style={styles.image} />
          <Text style={styles.title}>{product.title}</Text>

          <View style={styles.priceRow}>
            {!isEditingPrice ? (
              <>
                <Text style={styles.total}>Prix unitaire : {priceUnit} €</Text>
                <TouchableOpacity onPress={() => setIsEditingPrice(true)}>
                  <Text style={styles.editText}>Modifier</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TextInput
                placeholder="Prix (€)"
                value={priceUnit}
                onChangeText={handlePrixChange}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholderTextColor="#555"
              />
            )}
          </View>

          <Text style={styles.total}>Prix total : {total} €</Text>

          <TextInput
            placeholder="Couleur"
            value={couleur}
            onChangeText={setCouleur}
            style={styles.input}
            placeholderTextColor="#555"
          />
          <TextInput
            placeholder="Taille"
            value={taille}
            onChangeText={setTaille}
            style={styles.input}
            placeholderTextColor="#555"
          />
          <TextInput
            placeholder="Quantité"
            value={quantiteStr}
            onChangeText={setQuantiteStr}
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor="#555"
          />
          <TextInput
            placeholder="Autre (optionnel)"
            value={autre}
            onChangeText={setAutre}
            style={styles.input}
            placeholderTextColor="#555"
          />

          <View style={styles.row}>
            <TouchableOpacity onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (!priceUnit) {
                  alert('Veuillez entrer un prix');
                  return;
                }
                const data = {
                  ...product,
                  taille,
                  couleur,
                  quantite,
                  price: total,
                  price_unit: formatPrix(priceUnit),
                  autre,
                };
                onAdd(data);
                onClose();
                setIsEditingPrice(false);
              }}
              style={styles.add}
            >
              <Text style={styles.addText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#0008',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '90%',
  },
  image: {
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 6,
    borderRadius: 8,
    color: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  total: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  editText: {
    color: '#555',
    textDecorationLine: 'underline',
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancel: {
    padding: 10,
  },
  cancelText: {
    color: '#888',
  },
  add: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
  },
  addText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
