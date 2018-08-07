namespace QCVOC.Server.Data.Repository.Composite
{
    using System.Data;
    using Dapper;
    using QCVOC.Api.Data.ConnectionFactory;
    using QCVOC.Server.Data.Model.Composite;

    public class EventsServicesRepository : ICompositeRepository<EventsServices>
    {
        public EventsServicesRepository(IDbConnectionFactory connectionFactory)
        {
            ConnectionFactory = connectionFactory;
        }

        private IDbConnectionFactory ConnectionFactory { get; }

        public EventsServices Add(EventsServices composite, IDbTransaction transaction = null)
        {
            var query = @"
                INSERT INTO EventsServices (
                    eventid,
                    serviceid
                ) VALUES (
                    @eventid,
                    @serviceid
                )
            ";

            var param = new
            {
                eventid = composite.EventId,
                serviceid = composite.ServiceId,
            };

            using (var db = ConnectionFactory.CreateConnection())
            {
                db.Execute(query, param, transaction);
            }

            return composite;
        }

        public void Remove(EventsServices composite, IDbTransaction transaction = null)
        {
            var query = @"
                DELETE
                FROM EventsServices
                WHERE eventid = @eventid
                AND serviceid = @serviceid
            ";

            var param = new
            {
                eventid = composite.EventId,
                serviceid = composite.ServiceId,
            };

            using (var db = ConnectionFactory.CreateConnection())
            {
                db.Execute(query, param, transaction);
            }
        }
    }
}