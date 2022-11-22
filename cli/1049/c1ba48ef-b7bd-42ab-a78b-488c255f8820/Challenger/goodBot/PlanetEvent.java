public class PlanetEvent {
    int turnNumber;
    int fleetSize;
    String planetColor;
    String attackerColor;
    
    public PlanetEvent(int turnNumber, int fleetSize, String planetColor, String attackerColor) {
        this.turnNumber = turnNumber;
        this.fleetSize = fleetSize;
        this.planetColor = planetColor;
        this.attackerColor = attackerColor;
    }
}