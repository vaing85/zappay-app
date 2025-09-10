import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  recipient?: string;
  sender?: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  note?: string;
}

const TransactionHistoryScreen = ({ navigation }: any) => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'sent',
      amount: 50.00,
      recipient: 'John Doe',
      date: '2024-01-15T10:30:00Z',
      status: 'completed',
      note: 'Lunch money',
    },
    {
      id: '2',
      type: 'received',
      amount: 25.00,
      sender: 'Jane Smith',
      date: '2024-01-14T15:45:00Z',
      status: 'completed',
      note: 'Coffee money',
    },
    {
      id: '3',
      type: 'sent',
      amount: 100.00,
      recipient: 'Mike Johnson',
      date: '2024-01-13T09:15:00Z',
      status: 'completed',
      note: 'Rent split',
    },
    {
      id: '4',
      type: 'received',
      amount: 75.00,
      sender: 'Sarah Wilson',
      date: '2024-01-12T14:20:00Z',
      status: 'pending',
      note: 'Dinner bill',
    },
  ]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sent' | 'received'>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(t => t.type === selectedFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.note?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  React.useEffect(() => {
    filterTransactions();
  }, [searchQuery, selectedFilter, transactions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Text style={{ fontSize: 20 }}>
          {item.type === 'sent' ? '💸' : '💰'}
        </Text>
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>
          {item.type === 'sent' ? 'Sent to' : 'Received from'}{' '}
          {item.recipient || item.sender}
        </Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
        {item.note && (
          <Text style={styles.transactionNote}>{item.note}</Text>
        )}
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText,
          { color: item.type === 'sent' ? '#EF4444' : '#10B981' }
        ]}>
          {item.type === 'sent' ? '-' : '+'}${item.amount.toFixed(2)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F97316',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginLeft: 15,
    },
    backButton: {
      padding: 5,
    },
    searchContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    searchInput: {
      backgroundColor: '#F8FAFC',
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 16,
      color: '#1F2937',
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    filterContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    filterButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 10,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    activeFilterButton: {
      backgroundColor: '#F97316',
      borderColor: '#F97316',
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1F2937',
    },
    activeFilterButtonText: {
      color: '#FFFFFF',
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8FAFC',
      padding: 15,
      marginHorizontal: 20,
      marginBottom: 10,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    transactionDetails: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: 2,
    },
    transactionDate: {
      fontSize: 12,
      color: '#6B7280',
      marginBottom: 2,
    },
    transactionNote: {
      fontSize: 12,
      color: '#6B7280',
      fontStyle: 'italic',
    },
    transactionAmount: {
      alignItems: 'flex-end',
    },
    amountText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    statusText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textTransform: 'uppercase',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: '#6B7280',
      textAlign: 'center',
      marginTop: 20,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#FFFFFF', fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {['all', 'sent', 'received'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedFilter(filter as any)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.activeFilterButtonText,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      {filteredTransactions.length > 0 ? (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 64 }}>📊</Text>
          <Text style={styles.emptyStateText}>
            {searchQuery ? 'No transactions found matching your search' : 'No transactions yet'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default TransactionHistoryScreen;