import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import tipsData from '../../data/interviewTips.json';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import images directly
import researchImage from '../../data/tips/research.jpg';
import practiceImage from '../../data/tips/practice.jpg';
import dressImage from '../../data/tips/dress.jpg';
import arriveImage from '../../data/tips/arrive.jpg';
import prepareImage from '../../data/tips/prepare.jpg';
import followImage from '../../data/tips/follow.jpg';
import technicalImage from '../../data/tips/technical_quest.jpg';
import behavioralImage from '../../data/tips/behave.jpg';
import boostImage from '../../data/tips/boost.jpg';

const InterviewTips = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);

  const handleReadMore = (tip) => {
    setSelectedTip(tip);
    setModalVisible(true);
  };

  // Update tipsData with imported images
  const updatedTipsData = tipsData.map((tip) => {
    switch (tip.title) {
      case 'Research the Company':
        return { ...tip, image: researchImage };
      case 'Practice Common Questions':
        return { ...tip, image: practiceImage };
      case 'Dress Professionally':
        return { ...tip, image: dressImage };
      case 'Arrive Early':
        return { ...tip, image: arriveImage };
      case 'Prepare Questions':
        return { ...tip, image: prepareImage };
      case 'Follow Up':
        return { ...tip, image: followImage };
      case 'Technical Questions Preparation':
        return { ...tip, image: technicalImage };
      case 'Behavioral Questions Preparation':
        return { ...tip, image: behavioralImage };
      case 'Boost Your Interview IQ':
        return { ...tip, image: boostImage };
      default:
        return tip;
    }
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>  
        <MaterialIcons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>
      <ScrollView>
        <Text style={styles.title}>Interview Tips and Suggestions</Text>
        {updatedTipsData.map((tip) => (
          <View key={tip.id} style={styles.card}>
            <Image source={tip.image} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{tip.title}</Text>
              <Text style={styles.cardDescription}>{tip.description}</Text>
              <TouchableOpacity style={styles.button} onPress={() => handleReadMore(tip)}>
                <Text style={styles.buttonText}>Read More</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {selectedTip && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalCard}>
              <MaterialIcons name="info-outline" size={24} color="#FFF" style={styles.icon} />
              <Text style={styles.modalTitle}>{selectedTip.title}</Text>
              <Text style={styles.modalDescription}>{selectedTip.moreInfo}</Text>
              <Text style={styles.modalQuestionsTitle}>Interview Questions:</Text>
              {selectedTip.interviewQuestions.map((question, index) => (
                <Text key={index} style={styles.modalQuestion}>{question}</Text>
              ))}
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#292929',
    padding: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  card: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#1F1F1F',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#FFF',
  },
  modalDescription: {
    fontSize: 16,
    color: '#D1D5DB',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalQuestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFF',
  },
  modalQuestion: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginBottom: 10,
  },
});

export default InterviewTips;
