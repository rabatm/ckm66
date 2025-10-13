// Test script to verify reservation service works without subscription_id column
const { ReservationService } = require('./src/features/schedule/services/reservation.service')

async function testReservationService() {
  try {
    console.log('Testing ReservationService.getUserReservations...')

    // Test with a dummy user ID (this will fail with auth, but should not fail with column error)
    const reservations = await ReservationService.getUserReservations('test-user-id')

    console.log('✅ Success! No column error occurred')
    console.log('Reservations fetched:', reservations?.length || 0)
  } catch (error) {
    if (error.message?.includes('subscription_id')) {
      console.log('❌ Still getting subscription_id column error:', error.message)
    } else {
      console.log('✅ No subscription_id column error! Other error (expected):', error.message)
    }
  }
}

testReservationService()
